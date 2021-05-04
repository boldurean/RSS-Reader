import {
  extractFeed,
  extractPosts,
} from './utils.js';

export default (data, url) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(data, 'text/xml');
  const newFeed = extractFeed(content, url);
  const newPosts = extractPosts(content);
  return [newFeed, newPosts];
};
