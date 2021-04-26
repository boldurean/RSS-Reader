import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';

const addProxy = (url) => {
  const urlWithProxy = new URL(
    '/get',
    'https://hexlet-allorigins.herokuapp.com',
  );
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const getRssData = (url, watchedState, i18instance) => {
  watchedState.form.processState = 'sending';
  const urlWithProxy = addProxy(url);
  return axios
    .get(urlWithProxy)
    .then((response) => response.data.contents)
    .then((data) => parse(data))
    .catch((error) => {
      watchedState.form.processState = 'failed';
      watchedState.form.feedbackStatus = 'text-danger';
      watchedState.form.feedbackMsg = i18instance.t('feedback.errors.network');
      return error.message;
    });
};

const extractFeed = (parsedData, watchedState) => {
  const feedURL = watchedState.form.url;
  const feedTitle = parsedData.querySelector('title').textContent;
  const feedDescription = parsedData.querySelector('description').textContent;
  return [
    {
      url: feedURL,
      title: feedTitle,
      description: feedDescription,
    },
  ];
};

const extractPosts = (parsedData) => {
  const items = parsedData.querySelectorAll('item');

  return [...items].reduce((acc, item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    const newPost = {
      id: _.uniqueId(),
      title: postTitle,
      link: postLink,
      description: postDescription,
    };
    return [...acc, newPost];
  }, []);
};

export { addProxy, getRssData, extractFeed, extractPosts };
