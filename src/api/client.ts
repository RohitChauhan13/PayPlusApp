type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

export const API_URL = 'https://payplusserver.onrender.com/api';

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

let authSessionHandler: ((reason: 'blocked' | 'expired', message: string) => void) | undefined;

export const setAuthSessionHandler = (
  handler?: (reason: 'blocked' | 'expired', message: string) => void
) => {
  authSessionHandler = handler;
};

export const request = async <T>(
  path: string,
  { method = 'GET', token, body, query }: RequestOptions = {}
) => {
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const message = payload?.message || 'Something went wrong';
    const isBlocked = response.status === 403 && message.toLowerCase().includes('blocked');
    const isExpiredSession = response.status === 401 && Boolean(token);

    if (isBlocked) {
      authSessionHandler?.('blocked', message);
    } else if (isExpiredSession) {
      authSessionHandler?.('expired', message);
    }

    throw new ApiError(message, response.status);
  }

  return payload as T;
};
