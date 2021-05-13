import _ from 'lodash';
import onChange from 'on-change';

const getErrorMessage = (watchedState, i18instance) => {
  if (watchedState.form.error) {
    return i18instance.t(`errors.${watchedState.form.error}`);
  }
  return i18instance.t(`errors.${watchedState.rssLoading.error}`);
};

export default (initState, i18instance, elements) => {
  const handleFeedsChange = (state) => {
    const { feedsContainer } = elements;

    if (!state.feeds) return;
    feedsContainer.innerHTML = '';
    const feedsHeader = document.createElement('h2');
    feedsHeader.textContent = i18instance.t('feeds');
    const feedsGroup = document.createElement('ul');
    feedsGroup.classList.add('list-group', 'mb-5');

    const feeds = state.feeds.map(({ title, description }) => {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      const p = document.createElement('p');
      p.textContent = description;
      const newFeedElement = document.createElement('li');
      newFeedElement.classList.add('list-group-item');

      newFeedElement.append(h3, p);
      return newFeedElement;
    });
    feedsGroup.append(...feeds);
    feedsContainer.append(feedsHeader, feedsGroup);
  };

  const handleModalChange = (state) => {
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const linkButton = document.querySelector('.full-article');
    const post = state.posts.find((item) => item.id === state.modal.postID);
    const { title, description, link } = post;
    modalTitle.textContent = title;
    modalBody.textContent = description;
    linkButton.setAttribute('href', link);
  };

  const handleVisitedLinkChange = (state) => {
    const lastVisitedID = _.last(state.uiState.visited);
    const lastVisitedLink = document.querySelector(`a[data-id="${lastVisitedID}"]`);
    lastVisitedLink.classList.remove('font-weight-bold');
    lastVisitedLink.classList.add('font-weight-normal');
  };

  const handlePostsChange = (state) => {
    const { postsContainer } = elements;
    if (!state.posts) return;
    postsContainer.innerHTML = '';
    const postsHeader = document.createElement('h2');
    postsHeader.textContent = i18instance.t('posts');
    const postsGroup = document.createElement('ul');
    postsGroup.classList.add('list-group', 'mb-5');
    const posts = state.posts.map(
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
        const isVisited = state.uiState.visited.includes(id);
        const visitedClass = isVisited ? 'font-weight-normal' : 'font-weight-bold';
        a.classList.add(visitedClass);
        a.setAttribute('href', link);
        a.setAttribute('target', '_blank');
        a.setAttribute('data-id', id);
        a.textContent = title;
        const button = document.createElement('button');
        button.setAttribute('data-id', id);
        button.setAttribute('data-toggle', 'modal');
        button.setAttribute('data-target', '#modal');
        button.classList.add('btn', 'btn-primary', 'btn-sm');
        button.textContent = i18instance.t('buttons.view');
        newPost.append(a, button);
        return newPost;
      },
    );
    postsGroup.append(...posts);
    postsContainer.append(postsHeader, postsGroup);
  };

  const handleFormStateChange = (state) => {
    const { processState } = state.form;
    const { submitButton, urlField, feedback } = elements;

    switch (processState) {
      case 'idle':
        submitButton.disabled = false;
        urlField.removeAttribute('readonly');
        urlField.classList.remove('is-invalid');
        feedback.textContent = '';
        break;
      case 'failed':
        submitButton.disabled = false;
        urlField.removeAttribute('readonly');
        urlField.classList.add('is-invalid');
        feedback.classList.add('text-danger');
        feedback.textContent = getErrorMessage(state, i18instance);
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };
  const handleRssLoadingStateChange = (state) => {
    const { processState } = state.rssLoading;
    const { submitButton, urlField, feedback } = elements;

    switch (processState) {
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
        feedback.textContent = getErrorMessage(state, i18instance);
        break;
      default:
        throw new Error(`Unknown process state ${processState}`);
    }
  };

  return onChange(initState, (path) => {
    switch (path) {
      case 'form.processState':
        handleFormStateChange(initState);
        break;
      case 'rssLoading.processState':
        handleRssLoadingStateChange(initState);
        break;
      case 'feeds':
        handleFeedsChange(initState);
        break;
      case 'posts':
        handlePostsChange(initState);
        break;
      case 'uiState.visited':
        handleModalChange(initState);
        handleVisitedLinkChange(initState);
        break;
      default:
    }
  });
};
