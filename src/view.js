const renderFeedback = (value, elements) => {
  elements.feedbackField.classList.remove('text-danger', 'text-success');
  elements.urlField.classList.remove('is-invalid');
  elements.feedbackField.innerHTML = '';

  switch (value) {
    case null:
      return;
    case 'existing':
      elements.feedbackField.classList.add('text-danger');
      elements.feedbackField.textContent = 'RSS уже существует';
      elements.urlField.classList.add('is-invalid');
      break;
    case 'invalid':
      elements.feedbackField.classList.add('text-danger');
      elements.urlField.classList.add('is-invalid');
      elements.feedbackField.textContent = 'Ссылка должна быть валидным URL';
      break;
    case 'isnotrss':
      elements.feedbackField.classList.add('text-danger');
      elements.feedbackField.textContent = 'Ресурс не содержит валидный RSS';
      break;
    case 'success':
      elements.feedbackField.textContent = 'RSS успешно загружен';
      elements.feedbackField.classList.add('text-success');
      break;
    default:
      throw new Error(`Unknown case ${value}`);
  }
};

const renderFeeds = (watchedState, elements) => {
  if (!watchedState.form.feeds) return;
  elements.feedsContainer.innerHTML = '';
  const feedsHeader = document.createElement('h2');
  feedsHeader.textContent = 'Фиды';
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
  elements.feedsContainer.appendChild(feedsHeader);
  elements.feedsContainer.appendChild(feedsGroup);
  watchedState.form.processState = 'finished';
};

const renderPosts = (watchedState, elements) => {
  if (!watchedState.form.posts) return;
  elements.postsContainer.innerHTML = '';
  const postsHeader = document.createElement('h2');
  postsHeader.textContent = 'Посты';
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
  elements.postsContainer.appendChild(postsHeader);
  elements.postsContainer.appendChild(postsGroup);
  watchedState.form.processState = 'finished';
};

const processStateHandler = (processState, elements) => {
  switch (processState) {
    case 'filling':
      elements.submitButton.disabled = false;
      break;
    case 'sending':
      elements.submitButton.disabled = true;
      break;
    case 'finished':
      elements.submitButton.disabled = false;
      break;
    case 'failed':
      elements.submitButton.disabled = false;
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

export { renderFeedback, renderFeeds, renderPosts, processStateHandler };
