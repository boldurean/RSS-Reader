const tryParseXML = (xmlString) => {
  const parser = new DOMParser();
  const parsererrorNS = parser
    .parseFromString('INVALID', 'text/xml')
    .getElementsByTagName('parsererror')[0].namespaceURI;
  const dom = parser.parseFromString(xmlString, 'application/xml');
  if (dom.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0) {
    throw new Error('Error parsing XML');
  }
  return dom;
};

const extractFeed = (data) => {
  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  return [
    {
      title: feedTitle,
      description: feedDescription,
    },
  ];
};
const extractPosts = (data) => {
  const items = data.querySelectorAll('item');

  return [...items].map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    return {
      title: postTitle,
      description: postDescription,
      link: postLink,
    };
  });
};

export default (data) => {
  try {
    tryParseXML(data);
    const parser = new DOMParser();
    const content = parser.parseFromString(data, 'text/xml');
    const newFeed = extractFeed(content);
    const newPosts = extractPosts(content);
    return [newFeed, newPosts];
  } catch (error) {
    error.isParsingError = true;
    throw error;
  }
};
