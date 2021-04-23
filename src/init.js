// @ts-check
import axios from 'axios';
import _ from 'lodash';
import onChange from 'on-change';
import parse from './parser.js';
import validateField from './validate.js';
import {
  renderFeedback,
  renderPosts,
  renderFeeds,
  processStateHandler,
} from './view.js';

export default () => {
  const state = {
    form: {
      processState: 'filling',
      feedbackState: null,
      url: '',
      feeds: [],
      posts: [],
      loadedFeeds: [],
      valid: true,
      errors: {},
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    feedbackField: document.querySelector('div.feedback'),
    urlField: document.querySelector('input[name="url"]'),
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        processStateHandler(value, elements);
        break;
      case 'form.url':
        validateField(watchedState, elements);
        break;
      case 'form.feedbackState':
        renderFeedback(value, elements);
        break;
      case 'form.feeds':
        renderFeeds(watchedState, elements);
        break;
      case 'form.posts':
        renderPosts(watchedState, elements);
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
    watchedState.form.feedbackState = null;
    const urlWithProxy = addProxy(url);
    return axios
      .get(urlWithProxy)
      .then((response) => response.data.contents)
      .then((data) => parse(data))
      .catch((e) => {
        watchedState.form.processState = 'failed';
        watchedState.form.feedbackState = 'isnotrss';
        return e;
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
        watchedState.form.feedbackState = 'success';
        elements.form.reset();
      })
      .catch((error) => {
        watchedState.form.processState = 'failed';
        watchedState.form.feedbackState = 'isnotrss';
        return error;
      });
  });
};
