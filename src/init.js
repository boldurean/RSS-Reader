// @ts-check
import onChange from 'on-change';
import i18next from 'i18next';
import initAutoupdate from './autoupdate.js';
import resources from './locales/resources.js';
import { getRssData, extractFeed, extractPosts } from './utils.js';
import validate from './validate.js';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import {
  renderFeedback,
  renderPosts,
  renderFeeds,
  processStateHandler,
  updateFieldState,
  markVisited,
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
    modal: {
      title: null,
      body: null,
      link: null,
    },
    visitedLinkID: null,
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    feedback: document.querySelector('div.feedback'),
    urlField: document.querySelector('input[name="url"]'),
    modal: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    linkButton: document.querySelector('.full-article'),
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
      case 'visitedLinkID':
        markVisited(value, watchedState);
        break;
      case 'form.feedbackMsg':
        renderFeedback(value, watchedState, elements, i18instance);
        break;
      default:
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    watchedState.form.url = '';
    watchedState.form.url = url;
    if (!watchedState.form.valid) return;
    getRssData(url, watchedState, i18instance)
      .then((parsedData) => {
        const oldFeeds = watchedState.form.feeds;
        const newFeed = extractFeed(parsedData, watchedState);
        watchedState.form.feeds = [...newFeed, ...oldFeeds];

        const oldPosts = watchedState.form.posts;
        const newPosts = extractPosts(parsedData);
        watchedState.form.posts = [...newPosts, ...oldPosts];

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
  initAutoupdate(watchedState);
};
