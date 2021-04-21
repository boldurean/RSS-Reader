import onChange from 'on-change';
import validateField from './validate.js';
import state from './state.js';

const urlField = document.querySelector('input[name="url"]');
const submitButton = document.querySelector('button[type="submit"]');
const feedbackField = document.querySelector('div.feedback');
const feedsContainer = document.querySelector('.feeds');
const postsContainer = document.querySelector('.posts');

const renderFeedback = (value) => {
  feedbackField.classList.remove('text-danger', 'text-success');
  urlField.classList.remove('is-invalid');
  feedbackField.innerHTML = '';

  switch (value) {
    case null:
      return;
    case 'existing':
      feedbackField.classList.add('text-danger');
      feedbackField.textContent = 'RSS уже существует';
      urlField.classList.add('is-invalid');
      break;
    case 'invalid':
      feedbackField.classList.add('text-danger');
      urlField.classList.add('is-invalid');
      feedbackField.textContent = 'Ссылка должна быть валидным URL';
      break;
    case 'isnotrss':
      feedbackField.classList.add('text-danger');
      feedbackField.textContent = 'Ресурс не содержит валидный RSS';
      break;
    case 'success':
      feedbackField.textContent = 'RSS успешно загружен';
      feedbackField.classList.add('text-success');
      break;
    default:
      throw new Error(`Unknown case ${value}`);
  }
};

const renderFeeds = (watchedState) => {
  if (!watchedState.form.feeds) return;
  feedsContainer.innerHTML = '';
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
  feedsContainer.appendChild(feedsHeader);
  feedsContainer.appendChild(feedsGroup);
  watchedState.form.processState = 'finished';
};

const renderPosts = (watchedState) => {
  if (!watchedState.form.posts) return;
  postsContainer.innerHTML = '';
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
  postsContainer.appendChild(postsHeader);
  postsContainer.appendChild(postsGroup);
  watchedState.form.processState = 'finished';
};

const processStateHandler = (processState) => {
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

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'form.processState':
      processStateHandler(value);
      break;
    case 'form.url':
      validateField(watchedState);
      break;
    case 'form.feedbackState':
      renderFeedback(value);
      break;
    case 'form.feeds':
      renderFeeds(watchedState);
      break;
    case 'form.posts':
      renderPosts(watchedState);
      break;
    default:
  }
});

export default watchedState;
