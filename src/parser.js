const extractFeed = (data) => {
  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  return {
    title: feedTitle,
    description: feedDescription,
  };
};
const extractItems = (data) => {
  const items = data.querySelectorAll('item');

  return [...items].map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemLink = item.querySelector('link').textContent;
    const itemDescription = item.querySelector('description').textContent;
    return {
      title: itemTitle,
      description: itemDescription,
      link: itemLink,
    };
  });
};

export default (data) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(data, 'text/xml');
  if (content.querySelector('parsererror')) {
    const error = new Error('Error parsing XML');
    error.isParsingError = true;
    throw error;
  }
  const feed = extractFeed(content);
  const newItems = extractItems(content);
  return { feed, newItems };
};
