import _ from 'lodash';

const extractFeed = (data, feedURL) => {
  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  return [
    {
      url: feedURL,
      title: feedTitle,
      description: feedDescription,
    },
  ];
};

const extractPosts = (data) => {
  const items = data.querySelectorAll('item');

  return [...items].reduce((acc, item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    const newPost = {
      title: postTitle,
      description: postDescription,
      link: postLink,
      id: _.uniqueId(),
    };
    return [...acc, newPost];
  }, []);
};

export default (data, url) => {
  try {
    const parser = new DOMParser();
    const content = parser.parseFromString(data, 'text/xml');
    const newFeed = extractFeed(content, url);
    const newPosts = extractPosts(content);
    return [newFeed, newPosts];
  } catch (error) {
    error.isParsingError = true;
    throw error;
  }
};
