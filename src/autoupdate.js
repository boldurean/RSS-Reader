import axios from 'axios';
import _ from 'lodash';
import { addProxy } from './utils.js';
import parse from './parser.js';

const autoUpdate = (watchedState) => {
  const updateData = () => {
    const loadedFeedsUrls = watchedState.feeds.map(_.property('url'));
    loadedFeedsUrls.forEach((feedUrl) => {
      const proxedUrl = addProxy(feedUrl);
      return axios
        .get(proxedUrl)
        .then((response) => response.data.contents)
        .then((data) => parse(data, feedUrl))
        .then(([, newPosts]) => {
          const oldPosts = watchedState.posts;
          const updated = _.differenceBy(newPosts, oldPosts, 'link');
          watchedState.posts = [...updated, ...oldPosts];
        });
    });
    setTimeout(updateData, 5000);
  };
  setTimeout(updateData, 5000);
};

export default autoUpdate;
