import * as yup from 'yup';

export default (watchedState, i18instance) => {
  yup.setLocale({
    string: {
      url: i18instance.t('errors.validation.invalid'),
    },
  });

  const loadedUrls = watchedState.form.feeds.map((feed) => feed.url);
  const schema = yup.object().shape({
    url: yup
      .string()
      .url()
      .notOneOf(loadedUrls, i18instance.t('errors.validation.existing')),
  });

  const { url } = watchedState.form;

  try {
    schema.validateSync({ url });
    watchedState.form.valid = true;
    watchedState.form.feedbackStatus = 'text-success';
    watchedState.form.errors = null;
    return true;
  } catch (e) {
    watchedState.form.valid = false;
    watchedState.form.feedbackStatus = 'text-danger';
    watchedState.form.errors = e.message;
    return e;
  }
};
