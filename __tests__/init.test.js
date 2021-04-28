import { screen, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import fs from 'fs';
import path from 'path';
import nock from 'nock';
import init from '../src/init.js';

const rssUrl = 'https://ru.hexlet.io/lessons.rss';
const corsProxy = 'https://hexlet-allorigins.herokuapp.com';
const corsProxyApi = '/get';

const pathToRss = path.resolve(__dirname, '__fixtures__/rss.txt');
const pathToHtml = path.resolve(__dirname, '__fixtures__/index.html');

const rss = fs.readFileSync(pathToRss, 'utf-8');
const html = fs.readFileSync(pathToHtml, 'utf-8');

// eslint-disable-next-line functional/no-let
let elements;

beforeEach(() => {
  document.body.innerHTML = html;
  elements = {
    addButton: screen.getByText(/Add/i),
    input: screen.getByRole('textbox', { name: /url/i }),
  };
  init();
});

test('invalid link', async () => {
  expect(
    screen.queryByText('Ссылка должна быть валидным URL'),
  ).not.toBeInTheDocument();
  expect(elements.input).not.toHaveClass('is-invalid');

  await userEvent.type(elements.input, 'invalid link');
  await userEvent.click(elements.addButton);
  expect(
    screen.queryByText('Ссылка должна быть валидным URL'),
  ).toBeInTheDocument();
});

test('successful RSS', async () => {
  await userEvent.type(elements.input, rssUrl);
  const scope = nock(corsProxy)
    .get(corsProxyApi)
    .query({ url: rssUrl, disableCache: 'true' })
    .reply(200, { contents: rss });
  await userEvent.click(elements.addButton);
  await waitFor(() => {
    expect(document.body).toHaveTextContent('RSS успешно загружен');
  });

  scope.done();
});

test('existing RSS', async () => {
  await userEvent.type(elements.input, rssUrl);
  const scope = nock(corsProxy)
    .get(corsProxyApi)
    .query({ url: rssUrl, disableCache: 'true' })
    .reply(200, { contents: rss });

  await userEvent.click(elements.addButton);
  await waitFor(() => {
    expect(document.body).toHaveTextContent('RSS успешно загружен');
  });
  expect(elements.input).not.toHaveClass('is-invalid');
  scope.done();
  await userEvent.type(elements.input, rssUrl);
  await userEvent.click(elements.addButton);
  await waitFor(() => {
    expect(document.body).toHaveTextContent('RSS уже существует');
  });
  expect(elements.input).toHaveClass('is-invalid');
});

test('link without RSS content', async () => {
  await userEvent.type(elements.input, 'https://hexlet.io');

  const scope = nock(corsProxy)
    .get(corsProxyApi)
    .query({ url: 'https://hexlet.io', disableCache: 'true' })
    .reply(200, { contents: html });

  await userEvent.click(elements.addButton);
  await waitFor(() => {
    expect(document.body).toHaveTextContent('Ресурс не содержит валидный RSS');
  });
  scope.done();
});

test('network error', async () => {
  await userEvent.type(elements.input, 'https://vsbdn.io');

  const scope = nock(corsProxy)
    .get(corsProxyApi)
    .query({ url: 'https://vsbdn.io', disableCache: 'true' })
    .reply(404);

  await userEvent.click(elements.addButton);
  await waitFor(() => {
    expect(document.body).toHaveTextContent('Ошибка сети');
  });
  scope.done();
});

test('modal', async () => {
  nock(corsProxy)
    .get(corsProxyApi)
    .query({ url: rssUrl, disableCache: 'true' })
    .reply(200, { contents: rss });

  userEvent.type(screen.getByRole('textbox', { name: 'url' }), rssUrl);
  userEvent.click(screen.getByRole('button', { name: 'add' }));

  const previewBtns = await screen.findAllByRole('button', {
    name: /Просмотр/i,
  });
  expect(
    screen.getByRole('link', { name: /Миксины \/ HTML: Препроцессор Pug/i }),
  ).toHaveClass('font-weight-bold');
  userEvent.click(previewBtns[0]);
  expect(
    await screen.findByText(
      'Цель: Научиться создавать миксины для переиспользования вёрстки внутри Pug. Узнать о передаче аргументов и конструкции block',
    ),
  ).toBeVisible();
  expect(
    screen.getByRole('link', { name: /Миксины \/ HTML: Препроцессор Pug/i }),
  ).not.toHaveClass('font-weight-bold');
});
