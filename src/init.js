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

const fetchNewPosts = (watchedState) => {
  const updateData = () => {
    const loadedFeeds = watchedState.feeds
      .map(_.property('url'))
      .map(addProxy)
      .map((proxedUrl) => axios
        .get(proxedUrl)
        .then((response) => response.data.contents)
        .then((data) => parseRSS(data, proxedUrl))
        .then(([, newPosts]) => {
          const oldPosts = watchedState.posts;
          const updated = _.differenceBy(newPosts, oldPosts, 'link');
          watchedState.posts = [...updated, ...oldPosts];
        }));
    Promise.all(loadedFeeds)
      .then(setTimeout(updateData, 5000));
  };
  setTimeout(updateData, 5000);
};

export default () => {
  const i18instance = i18next.createInstance();
  return i18instance.init({
    lng: 'ru',
    resources,
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'invalid',
      },
    });
    const state = {
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
      feedback: document.querySelector('div.feedback'),
      feedsContainer: document.querySelector('.feeds'),
      postsContainer: document.querySelector('.posts'),
    };

    const watchedState = watcher(state, i18instance, elements);

    const validateField = (url) => {
      const loadedUrls = watchedState.feeds.map((feed) => feed.url);
      const schema = yup.object().shape({
        url: yup
          .string()
          .url()
          .notOneOf(loadedUrls, 'existing'),
      });
      return schema.validateSync({ url });
    };

    const getErrorType = (error) => {
      if (error.isAxiosError) return 'network';
      if (error.isParsingError) return 'parse';
      return 'unknown';
    };

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
        .then(([feed, newItems]) => {
          const newFeed = [{ url, ...feed }];
          const newPosts = newItems.map((post) => ({ id: _.uniqueId(), ...post }));
          watchedState.feeds = [...newFeed, ...watchedState.feeds];
          watchedState.posts = [...newPosts, ...watchedState.posts];

          watchedState.form.processState = 'finished';
          elements.form.reset();
        })
        .catch((error) => {
          watchedState.form.error = getErrorType(error);
          watchedState.form.processState = 'failed';
          return error;
        });
    });
    fetchNewPosts(watchedState);
  });
};
