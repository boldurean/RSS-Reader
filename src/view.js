const renderFeedback = (value, watchedState, elements, i18instance) => {
  const { feedback } = elements;
  feedback.classList.remove('text-danger', 'text-success');
  feedback.innerHTML = '';
  switch (value) {
    case null:
      return;
    case '':
      feedback.classList.add(watchedState.form.feedbackStatus);
      feedback.innerHTML = i18instance.t('feedback.success');
      break;
    default:
      feedback.classList.add(watchedState.form.feedbackStatus);
      feedback.innerHTML = value;
  }
};

const renderFeeds = (watchedState, elements, i18instance) => {
  if (!watchedState.form.feeds) return;
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';
  const feedsHeader = document.createElement('h2');
  feedsHeader.textContent = i18instance.t('feeds');
  const feedsGroup = document.createElement('ul');
  feedsGroup.classList.add('list-group', 'mb-5');

  watchedState.form.feeds.forEach(({ title, description }) => {
    const h3 = document.createElement('h3');
    h3.textContent = title;
    const p = document.createElement('p');
    p.textContent = description;
    const newFeedElement = document.createElement('li');
    newFeedElement.classList.add('list-group-item');

    newFeedElement.appendChild(h3);
    newFeedElement.appendChild(p);
    feedsGroup.appendChild(newFeedElement);
  });
  feedsContainer.appendChild(feedsHeader);
  feedsContainer.appendChild(feedsGroup);
  watchedState.form.processState = 'finished';
};

const renderPosts = (watchedState, elements, i18instance) => {
  const { postsContainer } = elements;
  if (!watchedState.form.posts) return;
  postsContainer.innerHTML = '';
  const postsHeader = document.createElement('h2');
  postsHeader.textContent = i18instance.t('posts');
  const postsGroup = document.createElement('ul');
  postsGroup.classList.add('list-group', 'mb-5');
  watchedState.form.posts.forEach(({ title, link }) => {
    const newPost = document.createElement('li');
    newPost.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
    );
    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.textContent = title;
    newPost.appendChild(a);
    postsGroup.appendChild(newPost);
  });
  postsContainer.appendChild(postsHeader);
  postsContainer.appendChild(postsGroup);
  watchedState.form.processState = 'finished';
};

const processStateHandler = (processState, elements) => {
  const { submitButton } = elements;
  switch (processState) {
    case 'filling':
      submitButton.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      break;
    case 'finished':
      submitButton.disabled = false;
      break;
    case 'failed':
      submitButton.disabled = false;
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

const updateFieldState = (value, elements) => {
  const { urlField } = elements;
  switch (value) {
    case false:
      urlField.classList.add('is-invalid');
      break;
    case true:
      urlField.classList.remove('is-invalid');
      break;
    default:
      throw new Error(`Unknown case ${value}`);
  }
};

export {
  renderFeedback,
  renderFeeds,
  renderPosts,
  processStateHandler,
  updateFieldState,
};
