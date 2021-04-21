import * as yup from 'yup';

const isLoaded = (coll, url) => {
  const existing = coll.filter((feed) => url === feed.url);
  return existing.length !== 0;
};

const schema = yup.object().shape({
  url: yup.string().url(),
});

export default (state) => {
  const { url } = state.form;
  try {
    schema.validateSync({ url });
    if (isLoaded(state.form.feeds, url)) {
      state.form.feedbackState = 'existing';
      state.form.valid = false;
      return false;
    }
    state.form.loadedFeeds.push(url);
    state.form.valid = true;
    return true;
  } catch (e) {
    state.form.feedbackState = 'invalid';
    state.form.valid = false;
    return false;
  }
};
