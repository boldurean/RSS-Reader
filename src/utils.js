import _ from 'lodash';

const addProxy = (url) => {
  const proxedUrl = new URL(
    '/get',
    'https://hexlet-allorigins.herokuapp.com',
  );
  proxedUrl.searchParams.set('url', url);
  proxedUrl.searchParams.set('disableCache', 'true');
  return proxedUrl.toString();
};

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

export {
  addProxy, extractFeed, extractPosts,
};
