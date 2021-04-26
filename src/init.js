// @ts-check
import axios from 'axios';
import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/resources.js';
import parse from './parser.js';
import validate from './validate.js';
import {
  renderFeedback,
  renderPosts,
  renderFeeds,
  processStateHandler,
  updateFieldState,
} from './view.js';

export default () => {
  const defaultLanguage = 'ru';
  const i18instance = i18next.createInstance();

  i18instance.init({
    lng: defaultLanguage,
    resources,
  });

  const state = {
    lng: defaultLanguage,
    form: {
      processState: 'filling',
      feedbackMsg: null,
      feedbackStatus: null,
      url: '',
      feeds: [],
      posts: [],
      valid: true,
      errors: null,
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    feedback: document.querySelector('div.feedback'),
    urlField: document.querySelector('input[name="url"]'),
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        processStateHandler(value, elements);
        break;
      case 'form.valid':
        updateFieldState(value, elements);
        break;
      case 'form.url':
        validate(watchedState, i18instance);
        break;
      case 'form.errors':
        renderFeedback(value, watchedState, elements, i18instance);
        break;
      case 'form.feeds':
        renderFeeds(watchedState, elements, i18instance);
        break;
      case 'form.posts':
        renderPosts(watchedState, elements, i18instance);
        break;
      default:
    }
  });

  const addProxy = (url) => {
    const urlWithProxy = new URL(
      '/get',
      'https://hexlet-allorigins.herokuapp.com',
    );
    urlWithProxy.searchParams.set('url', url);
    urlWithProxy.searchParams.set('disableCache', 'true');
    return urlWithProxy.toString();
  };

  const getRssData = (url) => {
    watchedState.form.processState = 'sending';
    const urlWithProxy = addProxy(url);
    return axios
      .get(urlWithProxy)
      .then((response) => response.data.contents)
      .then((data) => parse(data))
      .catch((error) => {
        watchedState.form.processState = 'failed';
        watchedState.form.feedbackStatus = 'text-danger';
        watchedState.form.feedbackMsg = i18instance.t(
          'feedback.errors.network',
        );
        return error.message;
      });
  };
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    watchedState.form.url = '';
    watchedState.form.url = data.get('url');
    if (!watchedState.form.valid) return;
    getRssData(watchedState.form.url)
      .then((parsedData) => {
        const feedID = _.uniqueId();
        const feedURL = watchedState.form.url;
        const feedTitle = parsedData.querySelector('title').textContent;
        const feedDescription = parsedData.querySelector('description')
          .textContent;
        const newFeed = {
          id: feedID,
          url: feedURL,
          title: feedTitle,
          description: feedDescription,
        };
        watchedState.form.feeds.unshift(newFeed);
        const posts = parsedData.querySelectorAll('item');
        posts.forEach((post) => {
          const postTitle = post.querySelector('title').textContent;
          const postLink = post.querySelector('link').textContent;
          const postDescription = post.querySelector('description').textContent;
          const newPost = {
            fromFeed: feedID,
            id: _.uniqueId(),
            title: postTitle,
            link: postLink,
            description: postDescription,
          };
          watchedState.form.posts.unshift(newPost);
        });
        watchedState.form.processState = 'finished';
        watchedState.form.feedbackStatus = 'text-success';
        watchedState.form.errors = '';
        elements.form.reset();
      })
      .catch((error) => {
        watchedState.form.processState = 'failed';
        watchedState.form.feedbackStatus = 'text-danger';
        watchedState.form.errors = i18instance.t('errors.parse.isnotrss');
        return error;
      });
  });
};
