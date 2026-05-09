import { delay, http, HttpResponse } from 'msw';
import { seedRequests } from './fixtures';
import type { CreateRequestPayload, SupportRequest } from '../features/requests/types';
import type { LoginFormValues } from '../features/auth/loginSchema';

const requestsStorageKey = 'testing-playground-requests';

let requests: SupportRequest[] = [...seedRequests];

function isSupportRequest(value: unknown): value is SupportRequest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<Record<keyof SupportRequest, unknown>>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    (candidate.priority === 'low' || candidate.priority === 'medium' || candidate.priority === 'high') &&
    (candidate.status === 'open' || candidate.status === 'in-progress' || candidate.status === 'closed') &&
    typeof candidate.createdAt === 'string'
  );
}

function canUseBrowserStorage() {
  return typeof localStorage !== 'undefined';
}

function readRequests() {
  if (!canUseBrowserStorage()) {
    return requests;
  }

  const storedRequests = localStorage.getItem(requestsStorageKey);

  if (!storedRequests) {
    return requests;
  }

  try {
    const parsed = JSON.parse(storedRequests) as unknown;

    if (Array.isArray(parsed) && parsed.every(isSupportRequest)) {
      requests = parsed;
    }
  } catch {
    localStorage.removeItem(requestsStorageKey);
  }

  return requests;
}

function writeRequests(nextRequests: SupportRequest[]) {
  requests = nextRequests;

  if (canUseBrowserStorage()) {
    localStorage.setItem(requestsStorageKey, JSON.stringify(nextRequests));
  }
}

export function resetMockRequests() {
  requests = [...seedRequests];

  if (canUseBrowserStorage()) {
    localStorage.removeItem(requestsStorageKey);
  }
}

export const handlers = [
  http.post('/login', async ({ request }) => {
    const body = (await request.json()) as LoginFormValues;

    await delay(150);

    if (body.email === 'error@example.com' || body.password === 'wrong-password') {
      return HttpResponse.json({ message: 'Неверный email или пароль' }, { status: 401 });
    }

    return HttpResponse.json({
      token: 'demo-token',
      user: {
        email: body.email,
      },
    });
  }),

  http.get('/requests', async ({ request }) => {
    const url = new URL(request.url);

    await delay(150);

    if (url.searchParams.get('scenario') === 'error') {
      return HttpResponse.json({ message: 'Сервис заявок временно недоступен' }, { status: 503 });
    }

    return HttpResponse.json({ requests: readRequests() });
  }),

  http.post('/requests', async ({ request }) => {
    const body = (await request.json()) as CreateRequestPayload;

    await delay(150);

    if (body.title.toLowerCase().includes('fail')) {
      return HttpResponse.json({ message: 'Не удалось сохранить заявку' }, { status: 500 });
    }

    const newRequest: SupportRequest = {
      id: `req-${Date.now()}`,
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    writeRequests([newRequest, ...readRequests()]);

    return HttpResponse.json(newRequest, { status: 201 });
  }),
];
