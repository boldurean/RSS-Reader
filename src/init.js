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

const fetchForNewPosts = (watchedState) => {
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
  i18instance.init({
    lng: 'ru',
    resources,
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'invalid',
      },
    });
  }).then(() => {
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
        visited: [],
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
        watchedState.form.error = null;
      } catch (error) {
        watchedState.form.error = error.message;
        watchedState.form.processState = 'failed';
        return error;
      }
      watchedState.form.processState = 'sending';
      return axios
        .get(addProxy(url))
        .then((response) => response.data.contents)
        .then((content) => parseRSS(content))
        .then(([newFeed, newPosts]) => {
          newFeed = newFeed.map((feed) => ({ url, ...feed }));
          newPosts = newPosts.map((post) => ({ id: _.uniqueId(), ...post }));
          watchedState.feeds = [...newFeed, ...watchedState.feeds];
          watchedState.posts = [...newPosts, ...watchedState.posts];

          watchedState.form.processState = 'finished';
          form.reset();
        })
        .catch((error) => {
          if (error.isAxiosError) {
            watchedState.form.error = 'network';
            watchedState.form.processState = 'failed';
            return error;
          }
          if (error.isParsingError) {
            watchedState.form.error = 'parse';
            watchedState.form.processState = 'failed';
            return error;
          }
          watchedState.form.error = 'unknown';
          watchedState.form.processState = 'failed';
          return error;
        });
    });
    fetchForNewPosts(watchedState);
  });
};
