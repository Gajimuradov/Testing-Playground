import type { LoginFormValues } from '../features/auth/loginSchema';
import type { CreateRequestPayload, SupportRequest } from '../features/requests/types';

type LoginResponse = {
  token: string;
  user: {
    email: string;
  };
};

type RequestsResponse = {
  requests: SupportRequest[];
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? 'Запрос завершился ошибкой');
  }

  return data as T;
}

export async function login(payload: LoginFormValues) {
  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<LoginResponse>(response);
}

export async function getRequests(options: { shouldFail?: boolean } = {}) {
  const searchParams = new URLSearchParams();

  if (options.shouldFail) {
    searchParams.set('scenario', 'error');
  }

  const response = await fetch(`/requests${searchParams.size > 0 ? `?${searchParams}` : ''}`);
  const data = await parseJsonResponse<RequestsResponse>(response);

  return data.requests;
}

export async function createRequest(payload: CreateRequestPayload) {
  const response = await fetch('/requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<SupportRequest>(response);
}
