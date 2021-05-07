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

const checkForNewPosts = (watchedState) => {
  const updateData = () => {
    const loadedFeedsUrls = watchedState.feeds
      .map(_.property('url'))
      .map((feedUrl) => addProxy(feedUrl))
      .map((proxedUrl) => axios
        .get(proxedUrl)
        .then((response) => response.data.contents)
        .then((data) => parseRSS(data, proxedUrl))
        .then(([, newPosts]) => {
          const oldPosts = watchedState.posts;
          const updated = _.differenceBy(newPosts, oldPosts, 'link');
          watchedState.posts = [...updated, ...oldPosts];
        }));
    Promise.all(loadedFeedsUrls).then(setTimeout(updateData, 5000));
  };
  setTimeout(updateData, 5000);
};

const i18instance = i18next.createInstance();

const initI18n = () => i18instance.init({
  lng: 'ru',
  resources,
}).then(() => {
  yup.setLocale({
    string: {
      url: 'invalid',
    },
  });
});

const app = () => {
  const state = {
    form: {
      processState: 'filling',
      url: '',
      error: null,
    },
    feeds: [],
    posts: [],
    modal: {
      postID: null,
    },
    uiState: {
      links: {
        visited: [],
      },
    },
    rssLoading: {
      error: null,
    },
  };

  const watchedState = watcher(state, i18instance);

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

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    watchedState.form.url = url;
    try {
      validateField(url);
      watchedState.form.error = {};
    } catch (error) {
      watchedState.form.error = error.message;
      watchedState.form.processState = 'failed';
      return error;
    }
    watchedState.form.processState = 'sending';
    return axios
      .get(addProxy(url))
      .then((response) => response.data.contents)
      .then((content) => parseRSS(content, url))
      .then(([newFeed, newPosts]) => {
        watchedState.feeds = [...newFeed, ...watchedState.feeds];
        watchedState.posts = [...newPosts, ...watchedState.posts];

        watchedState.form.processState = 'finished';
        form.reset();
      })
      .catch((error) => {
        if (error.isAxiosError) {
          watchedState.form.error = 'network';
          watchedState.form.processState = 'failed';
        }
        if (error.isParsingError) {
          watchedState.form.error = 'parse';
          watchedState.form.processState = 'failed';
        }
        return error;
      });
  });
  checkForNewPosts(watchedState);
};

export default () => {
  initI18n().then(app);
};
