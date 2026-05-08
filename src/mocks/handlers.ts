import { delay, http, HttpResponse } from 'msw';
import { seedRequests } from './fixtures';
import type { CreateRequestPayload, SupportRequest } from '../features/requests/types';
import type { LoginFormValues } from '../features/auth/loginSchema';

let requests: SupportRequest[] = [...seedRequests];

export function resetMockRequests() {
  requests = [...seedRequests];
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

    return HttpResponse.json({ requests });
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

    requests = [newRequest, ...requests];

    return HttpResponse.json(newRequest, { status: 201 });
  }),
];
