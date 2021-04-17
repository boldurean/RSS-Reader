import app from '../src/app.js';

test('app', () => {
  expect(app()).toBe('Boom!');
});
