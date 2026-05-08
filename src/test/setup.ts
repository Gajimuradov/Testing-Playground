import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '../mocks/server';
import { resetMockRequests } from '../mocks/handlers';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

afterEach(() => {
  server.resetHandlers();
  resetMockRequests();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});
