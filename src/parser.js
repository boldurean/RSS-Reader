import {
  extractFeed,
  extractPosts,
} from './utils.js';

export default (data) => {
  const parser = new DOMParser();
  const { url } = data.status;
  const content = parser.parseFromString(data.contents, 'text/xml');
  const newFeed = extractFeed(content, url);
  const newPosts = extractPosts(content);
  return [newFeed, newPosts];
};
