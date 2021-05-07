import onChange from 'on-change';

const getErrorType = (watchedState, i18instance) => {
  if (watchedState.form.error) {
    return i18instance.t(`errors.${watchedState.form.error}`);
  }
  return i18instance.t(`errors.${watchedState.rssLoading.error}`);
};

const renderFeeds = (watchedState, i18instance) => {
  const feedsContainer = document.querySelector('.feeds');

  if (!watchedState.feeds) return;
  feedsContainer.innerHTML = '';
  const feedsHeader = document.createElement('h2');
  feedsHeader.textContent = i18instance.t('feeds');
  const feedsGroup = document.createElement('ul');
  feedsGroup.classList.add('list-group', 'mb-5');

  watchedState.feeds.forEach(({ title, description }) => {
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
};

const updateModal = (watchedState) => {
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const linkButton = document.querySelector('.full-article');
  const post = watchedState.posts.find((item) => item.id === watchedState.modal.postID);
  const { title, description, link } = post;
  modalTitle.textContent = title;
  modalBody.textContent = description;
  linkButton.setAttribute('href', link);
};

const renderPosts = (watchedState, i18instance) => {
  const postsContainer = document.querySelector('.posts');

  if (!watchedState.posts) return;
  postsContainer.innerHTML = '';
  const postsHeader = document.createElement('h2');
  postsHeader.textContent = i18instance.t('posts');
  const postsGroup = document.createElement('ul');
  postsGroup.classList.add('list-group', 'mb-5');
  watchedState.posts.forEach(
    ({
      title, link, id,
    }) => {
      const newPost = document.createElement('li');
      newPost.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
      );
      const a = document.createElement('a');
      const isVisited = watchedState.uiState.links.visited.includes(id);
      const visitedClass = isVisited ? 'font-weight-normal' : 'font-weight-bold';
      a.classList.add(visitedClass);
      a.setAttribute('href', link);
      a.setAttribute('target', '_blank');
      a.setAttribute('data-id', id);
      a.textContent = title;
      a.addEventListener('click', (e) => {
        e.target.classList.remove('font-weight-bold');
        e.target.classList.add('font-weight-normal');
        watchedState.uiState.links.visited.push(id);
      });
      const button = document.createElement('button');
      button.setAttribute('data-id', id);
      button.setAttribute('data-toggle', 'modal');
      button.setAttribute('data-target', '#modal');
      button.classList.add('btn', 'btn-primary', 'btn-sm');
      button.textContent = 'Просмотр';
      button.addEventListener('click', ({ target }) => {
        watchedState.modal.postID = id;
        watchedState.uiState.links.visited.push(id);
        target.previousElementSibling.classList.remove('font-weight-bold');
        target.previousElementSibling.classList.add('font-weight-normal');
        updateModal(watchedState);
      });
      newPost.appendChild(a);
      newPost.appendChild(button);
      postsGroup.appendChild(newPost);
    },
  );
  postsContainer.appendChild(postsHeader);
  postsContainer.appendChild(postsGroup);
};

const processStateHandler = (watchedState, i18instance) => {
  const { processState } = watchedState.form;
  const submitButton = document.querySelector('button[type="submit"]');
  const urlField = document.querySelector('input[name="url"]');
  const feedback = document.querySelector('div.feedback');

  switch (processState) {
    case 'filling':
      submitButton.disabled = false;
      urlField.removeAttribute('readonly');
      urlField.classList.remove('is-invalid');
      break;
    case 'sending':
      submitButton.disabled = true;
      urlField.setAttribute('readonly', 'readonly');
      feedback.classList.remove('text-success', 'text-danger', 'is-invalid');
      feedback.textContent = '';
      break;
    case 'finished':
      submitButton.disabled = false;
      urlField.removeAttribute('readonly');
      urlField.classList.remove('is-invalid');
      feedback.classList.add('text-success');
      feedback.textContent = i18instance.t('feedback.success');
      break;
    case 'failed':
      submitButton.disabled = false;
      urlField.removeAttribute('readonly');
      urlField.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = getErrorType(watchedState, i18instance);
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

const watcher = (state, i18instance) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.processState':
      case 'form.error':
      case 'rssLoading.error':
        processStateHandler(watchedState, i18instance);
        break;
      case 'feeds':
        renderFeeds(watchedState, i18instance);
        break;
      case 'posts':
        renderPosts(watchedState, i18instance);
        break;
      default:
    }
  });
  return watchedState;
};

export default watcher;
