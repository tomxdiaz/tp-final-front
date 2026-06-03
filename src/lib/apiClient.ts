import axios, { type AxiosRequestConfig, type Method } from 'axios';
import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_URL) {
  throw new Error('Missing VITE_API_BASE_URL environment variable');
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiClientOptions = {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean;
};

type BackendErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting Supabase session:', error);

    return null;
  }

  return data.session?.access_token ?? null;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
});

function getErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'object' && data !== null) {
    const errorData = data as BackendErrorResponse;

    if (Array.isArray(errorData.message)) {
      return errorData.message.join(', ');
    }

    if (typeof errorData.message === 'string') {
      return errorData.message;
    }

    if (typeof errorData.error === 'string') {
      return errorData.error;
    }
  }

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  return `API request failed with status ${status}`;
}

export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, requireAuth = true } = options;

  const token = requireAuth ? await getAccessToken() : null;

  if (requireAuth && !token) {
    throw new Error('User is not authenticated');
  }

  const config: AxiosRequestConfig = {
    url: endpoint,
    method: method as Method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    data: body,
  };

  try {
    const response = await axiosInstance.request<T>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const data = error.response?.data ?? null;
      const message = getErrorMessage(data, status);

      throw new ApiError(message, status, data);
    }

    throw error;
  }
}
