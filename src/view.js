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
  watchedState.form.posts.forEach(
    ({ title, description, link, id, visited }) => {
      const newPost = document.createElement('li');
      const visitedClass = visited ? 'font-weight-normal' : 'font-weight-bold';
      newPost.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        visitedClass,
      );
      const a = document.createElement('a');
      a.setAttribute('href', link);
      a.setAttribute('target', '_blank');
      a.setAttribute('data-id', id);
      a.addEventListener('click', () => {
        watchedState.visitedLinkID = id;
      });
      a.textContent = title;
      const button = document.createElement('button');
      button.setAttribute('data-id', id);
      button.setAttribute('data-toggle', 'modal');
      button.setAttribute('data-target', '#modal');
      button.classList.add('btn', 'btn-primary', 'btn-sm');
      button.textContent = i18instance.t('buttons.openModal');
      button.addEventListener('click', () => {
        watchedState.modal.title = title;
        watchedState.modal.body = description;
        watchedState.modal.link = link;
        watchedState.visitedLinkID = id;
      });
      newPost.appendChild(a);
      newPost.appendChild(button);
      postsGroup.appendChild(newPost);
    },
  );
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

const toggleModal = (watchedState, elements) => {
  const { modal } = elements;
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const linkButton = modal.querySelector('.full-article');
  modalTitle.textContent = watchedState.modal.title;
  modalBody.textContent = watchedState.modal.body;
  linkButton.setAttribute('href', watchedState.modal.link);
};

const markVisited = (id, watchedState) => {
  const postLink = document.querySelector(`a[data-id="${id}"]`);
  postLink.classList.remove('font-weight-bold');
  postLink.classList.add('font-weight-normal');

  const post = watchedState.form.posts.find((item) => id === item.id);
  post.visited = true;
};

export {
  renderFeedback,
  renderFeeds,
  renderPosts,
  processStateHandler,
  updateFieldState,
  toggleModal,
  markVisited,
};
