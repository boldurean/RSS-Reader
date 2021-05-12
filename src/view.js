import _ from 'lodash';
import onChange from 'on-change';

const getErrorMessage = (watchedState, i18instance) => {
  if (watchedState.form.error) {
    return i18instance.t(`errors.${watchedState.form.error}`);
  }
  return i18instance.t(`errors.${watchedState.rssLoading.error}`);
};

export default (state, i18instance, elements) => {
  const handleFeedsChange = (st) => {
    const { feedsContainer } = elements;

    if (!st.feeds) return;
    feedsContainer.innerHTML = '';
    const feedsHeader = document.createElement('h2');
    feedsHeader.textContent = i18instance.t('feeds');
    const feedsGroup = document.createElement('ul');
    feedsGroup.classList.add('list-group', 'mb-5');

    const feeds = st.feeds.map(({ title, description }) => {
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

  const handleModalChange = (st) => {
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const linkButton = document.querySelector('.full-article');
    const post = st.posts.find((item) => item.id === st.modal.postID);
    const { title, description, link } = post;
    modalTitle.textContent = title;
    modalBody.textContent = description;
    linkButton.setAttribute('href', link);
  };

  const handleVisitedLinkChange = (st) => {
    const lastVisitedID = _.last(st.uiState.visited);
    const lastVisitedLink = document.querySelector(`a[data-id="${lastVisitedID}"]`);
    lastVisitedLink.classList.remove('font-weight-bold');
    lastVisitedLink.classList.add('font-weight-normal');
  };

  console.log('posts.invalid');

  const handlePostsChange = (st) => {
    const { postsContainer } = elements;
    if (!st.posts) return;
    postsContainer.innerHTML = '';
    const postsHeader = document.createElement('h2');
    postsHeader.textContent = i18instance.t('posts');
    const postsGroup = document.createElement('ul');
    postsGroup.classList.add('list-group', 'mb-5');
    const posts = st.posts.map(
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
        const isVisited = st.uiState.visited.includes(id);
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

  const handleFormStateChange = (st) => {
    const { processState } = st.form;
    const { submitButton, urlField, feedback } = elements;

    switch (processState) {
      case 'idle':
        submitButton.disabled = false;
        urlField.removeAttribute('readonly');
        urlField.classList.remove('is-invalid');
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
        feedback.textContent = getErrorMessage(st, i18instance);
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };
  const handleRssLoadingStateChange = (st) => {
    const { processState } = st.rssLoading;
    const { submitButton, urlField, feedback } = elements;

    switch (processState) {
      case 'sending':
        submitButton.disabled = true;
        urlField.setAttribute('readonly', 'readonly');
        feedback.classList.remove('text-success', 'text-danger', 'is-invalid');
        feedback.textContent = '';
        break;
      default:
        throw new Error(`Unknown process state ${processState}`);
    }
  };

  return onChange(state, (path) => {
    switch (path) {
      case 'form.processState':
      case 'form.error':
      case 'rssLoading.error':
        handleFormStateChange(state);
        break;
      case 'rssLoading.processState':
        handleRssLoadingStateChange(state);
        break;
      case 'feeds':
        handleFeedsChange(state);
        break;
      case 'posts':
        handlePostsChange(state);
        break;
      case 'uiState.visited':
        handleModalChange(state);
        handleVisitedLinkChange(state);
        break;
      default:
    }
  });
};
