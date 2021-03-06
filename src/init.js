// @ts-check
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import * as yup from 'yup';
import resources from './locales/resources.js';
import watcher from './view.js';
import parseRSS from './parser.js';
import 'bootstrap';

const addProxy = (url) => {
  const proxedUrl = new URL(
    '/get',
    'https://hexlet-allorigins.herokuapp.com',
  );
  proxedUrl.searchParams.set('url', url);
  proxedUrl.searchParams.set('disableCache', 'true');
  return proxedUrl.toString();
};

const updateTimeout = 5000;

const fetchNewPosts = async (watchedState) => {
  const postPromises = watchedState.feeds
    .map(_.property('url'))
    .map(addProxy)
    .map(async (proxedUrl) => {
      await axios
        .get(proxedUrl)
        .then((response) => response.data.contents)
        .then((data) => parseRSS(data))
        .then(({ newItems }) => {
          const oldPosts = watchedState.posts;
          const newPosts = _.differenceBy(newItems, oldPosts, 'link');
          watchedState.posts = [...newPosts, ...oldPosts];
        });
    });
  await Promise.all(postPromises).then(setTimeout(fetchNewPosts, updateTimeout, watchedState));
};

const getErrorType = (error) => {
  if (error.isAxiosError) return 'network';
  if (error.isParsingError) return 'parse';
  return 'unknown';
};

export default async () => {
  const defaultLanguage = localStorage.getItem('language') ?? 'en';

  const state = {
    defaultLanguage,
    form: {
      processState: 'idle',
      url: '',
      error: null,
    },
    feeds: [],
    posts: [],
    modal: {
      postID: null,
    },
    uiState: {
      visited: [],
    },
    rssLoading: {
      processState: 'idle',
      error: null,
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    urlField: document.querySelector('input[name="url"]'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    lngButtons: document.querySelectorAll('button[data-lng]'),
    rssTitle: document.querySelector('.rss-title'),
    rssSubtitle: document.querySelector('.rss-subtitle'),
    example: document.querySelector('.example'),
  };

  const i18instance = i18next.createInstance();

  await i18instance.init({
    lng: defaultLanguage,
    resources,
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'urlInvalid',
      },
    });
  });

  const watchedState = watcher(state, i18instance, elements);

  const validateField = (url) => {
    const loadedUrls = watchedState.feeds.map((_.property('url')));
    const schema = yup.object().shape({
      url: yup
        .string()
        .url()
        .trim()
        .notOneOf(loadedUrls, 'urlExisting'),
    });
    return schema.validateSync({ url });
  };

  elements.postsContainer.addEventListener('click', ({ target }) => {
    const li = target.closest('li');
    const link = li.querySelector('a');
    const button = li.querySelector('button');
    if (target === button) {
      watchedState.modal.postID = target.dataset.id;
      watchedState.uiState.visited.push(target.dataset.id);
    }
    if (target === link) {
      watchedState.uiState.visited.push(target.dataset.id);
    }
  });

  elements.lngButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      localStorage.removeItem('language');
      watchedState.defaultLanguage = e.target.dataset.lng;
    });
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    watchedState.form.url = url;
    try {
      validateField(url);
      watchedState.form.processState = 'idle';
    } catch (error) {
      watchedState.form.error = error.message;
      watchedState.form.processState = 'failed';
      return error;
    }
    watchedState.rssLoading.processState = 'sending';
    return axios
      .get(addProxy(url))
      .then((response) => response.data.contents)
      .then((content) => parseRSS(content))
      .then(({ feed, newItems }) => {
        const newFeed = { url, ...feed };
        const newPosts = newItems.map((post) => ({ id: _.uniqueId(), ...post }));
        watchedState.feeds.unshift(newFeed);
        watchedState.posts.unshift(...newPosts);

        watchedState.rssLoading.processState = 'finished';
        elements.form.reset();
      })
      .catch((error) => {
        watchedState.rssLoading.error = getErrorType(error);
        watchedState.rssLoading.processState = 'failed';
        return error;
      });
  });
  setTimeout(fetchNewPosts, updateTimeout, watchedState);
};
