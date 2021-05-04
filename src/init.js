// @ts-check
import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import initAutoupdate from './autoupdate.js';
import resources from './locales/resources.js';
import {
  addProxy,
} from './utils.js';
import watcher from './view.js';
import parse from './parser.js';
import 'bootstrap';

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
  }).then(() => {
    const defaultLanguage = 'ru';
    const state = {
      lng: defaultLanguage,
      form: {
        processState: 'filling',
        url: '',
        valid: true,
        errors: {},
      },
      feeds: [],
      posts: [],
      modal: {
        title: null,
        body: null,
        link: null,
      },
      uiState: {
        links: {
          visitedLink: null,
          visitedLinks: [],
        },
      },
    };

    const watchedState = watcher(state, i18instance);

    const validate = (url) => {
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
        validate(url);
        watchedState.form.errors = {};
      } catch (error) {
        watchedState.form.valid = false;
        watchedState.form.errors = { validation: error.message };
        watchedState.form.processState = 'failed';
        return error;
      }
      watchedState.form.processState = 'sending';
      const proxedUrl = addProxy(url);
      return axios
        .get(proxedUrl)
        .then((response) => response.data)
        .then((content) => parse(content))
        .then(([newFeed, newPosts]) => {
          const oldFeeds = watchedState.feeds;
          watchedState.feeds = [...newFeed, ...oldFeeds];

          const oldPosts = watchedState.posts;
          watchedState.posts = [...newPosts, ...oldPosts];

          watchedState.form.processState = 'finished';
          form.reset();
        })
        .catch((error) => {
          if (error.isAxiosError) {
            watchedState.form.errors.network = 'network';
            watchedState.form.processState = 'failed';
            return error;
          }
          watchedState.form.errors.parse = 'parse';
          watchedState.form.processState = 'failed';
          return error;
        });
    });
    initAutoupdate(watchedState);
  });
};
