import { env } from '../config/env';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: HeadersInit;
};

export async function apiClient<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers } = options;

  const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw {
      status: response.status,
      message: errorBody?.message ?? 'Unexpected API error',
      details: errorBody,
    };
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
