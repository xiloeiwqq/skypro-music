const API_URL = 'https://webdev-music-003b5b991590.herokuapp.com';

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === 'string') {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    for (const key of ['detail', 'message', 'error', 'email', 'password']) {
      const value = data[key];
      if (typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        return value.join(' ');
      }
    }
  }

  return `Ошибка запроса (${status})`;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  return payload as T;
}

export function getRequestError(error: unknown): string {
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос';
}
