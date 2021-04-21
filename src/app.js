// @ts-check
import axios from 'axios';
import _ from 'lodash-es';
import parse from './parser.js';
import watchedState from './view.js';

export default () => {
  const form = document.querySelector('.rss-form');

  const getRssData = (url) => {
    watchedState.form.processState = 'sending';
    watchedState.form.feedbackState = null;
    const path = 'https://hexlet-allorigins.herokuapp.com/get?url=';
    return axios
      .get(`${path}${url}`)
      .then((response) => response.data.contents)
      .then((data) => parse(data))
      .catch((e) => {
        watchedState.form.processState = 'failed';
        watchedState.form.feedbackState = 'isnotrss';
        return e;
      });
  };

  form.addEventListener('submit', (e) => {
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
        form.reset();
      })
      .catch((error) => {
        watchedState.form.processState = 'failed';
        watchedState.form.feedbackState = 'isnotrss';
        return error;
      });
  });
};
