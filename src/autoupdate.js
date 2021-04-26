import axios from 'axios';
import _ from 'lodash';
import { addProxy, extractPosts } from './utils.js';
import parse from './parser.js';

const autoUpdate = (watchedState) => {
  const updateData = () => {
    const loadedFeedsUrls = watchedState.form.feeds.map(_.property('url'));
    loadedFeedsUrls.forEach((feedUrl) => {
      const proxedUrl = addProxy(feedUrl);
      return axios
        .get(proxedUrl)
        .then((response) => response.data.contents)
        .then((content) => parse(content))
        .then((rss) => extractPosts(rss))
        .then((newPosts) => {
          const oldPosts = watchedState.form.posts;
          const updated = _.differenceBy(newPosts, oldPosts, 'link');
          watchedState.form.posts = [...updated, ...oldPosts];
        });
    });
    setTimeout(updateData, 5000);
  };
  setTimeout(updateData, 5000);
};

export default autoUpdate;
