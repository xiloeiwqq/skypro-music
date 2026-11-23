import type {
  AuthSession,
  AuthTokens,
  Selection,
  Track,
  User,
} from '@/data';
import { clearSession, getSession, saveSession } from './session';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  'https://webdev-music-003b5b991590.herokuapp.com'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(payload: unknown, status: number) {
  if (isRecord(payload)) {
    for (const key of ['message', 'detail']) {
      if (typeof payload[key] === 'string') return payload[key];
    }

    for (const value of Object.values(payload)) {
      if (typeof value === 'string') return value;
      if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        return value.join(' ');
      }
    }
  }

  return `Ошибка запроса (${status}). Попробуйте ещё раз.`;
}

async function requestJson(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<unknown> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      'Не удалось подключиться к серверу. Проверьте соединение и повторите попытку.',
      0,
    );
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(getErrorMessage(null, response.status), response.status);
    }
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status);
  }

  return payload;
}

function unwrapData(payload: unknown): unknown {
  if (!isRecord(payload) || payload.success !== true || !('data' in payload)) {
    throw new ApiError('Сервер вернул данные в неожиданном формате.', 200);
  }

  return payload.data;
}

function parseTrack(value: unknown): Track {
  if (
    !isRecord(value) ||
    typeof value._id !== 'number' ||
    typeof value.name !== 'string' ||
    typeof value.author !== 'string' ||
    typeof value.release_date !== 'string' ||
    !Array.isArray(value.genre) ||
    !value.genre.every((item) => typeof item === 'string') ||
    typeof value.duration_in_seconds !== 'number' ||
    typeof value.album !== 'string' ||
    typeof value.track_file !== 'string'
  ) {
    throw new ApiError('Сервер вернул некорректные данные трека.', 200);
  }

  return {
    _id: value._id,
    name: value.name,
    author: value.author,
    release_date: value.release_date,
    genre: value.genre,
    duration_in_seconds: value.duration_in_seconds,
    album: value.album,
    track_file: value.track_file,
    staredUser:
      Array.isArray(value.staredUser) &&
      value.staredUser.every((item) => typeof item === 'number')
        ? value.staredUser
        : undefined,
  };
}

function parseTrackList(value: unknown): Track[] {
  if (!Array.isArray(value)) {
    throw new ApiError('Сервер вернул некорректный список треков.', 200);
  }

  return value.map(parseTrack);
}

function parseSelection(value: unknown): Selection {
  if (
    !isRecord(value) ||
    typeof value._id !== 'number' ||
    !Array.isArray(value.items) ||
    !value.items.every((item) => typeof item === 'number') ||
    !Array.isArray(value.owner) ||
    !value.owner.every((item) => typeof item === 'number') ||
    (value.name !== undefined && typeof value.name !== 'string')
  ) {
    throw new ApiError('Сервер вернул некорректные данные подборки.', 200);
  }

  return {
    _id: value._id,
    name: value.name,
    items: value.items,
    owner: value.owner,
  };
}

function parseSelectionList(value: unknown): Selection[] {
  if (!Array.isArray(value)) {
    throw new ApiError('Сервер вернул некорректный список подборок.', 200);
  }

  return value.map(parseSelection);
}

function parseUser(value: unknown): User {
  if (
    !isRecord(value) ||
    typeof value._id !== 'number' ||
    typeof value.email !== 'string' ||
    typeof value.username !== 'string'
  ) {
    throw new ApiError('Сервер вернул некорректные данные пользователя.', 200);
  }

  return {
    _id: value._id,
    email: value.email,
    username: value.username,
  };
}

function parseTokens(value: unknown): AuthTokens {
  if (
    !isRecord(value) ||
    typeof value.access !== 'string' ||
    typeof value.refresh !== 'string'
  ) {
    throw new ApiError('Сервер вернул некорректные данные авторизации.', 200);
  }

  return {
    access: value.access,
    refresh: value.refresh,
  };
}

function parseAccessToken(value: unknown): string {
  if (!isRecord(value) || typeof value.access !== 'string') {
    throw new ApiError('Не удалось обновить токен доступа.', 200);
  }

  return value.access;
}

export async function fetchTracks() {
  return parseTrackList(unwrapData(await requestJson('/catalog/track/all/')));
}

export async function fetchSelections() {
  return parseSelectionList(
    unwrapData(await requestJson('/catalog/selection/all')),
  );
}

export async function fetchSelection(id: string) {
  return parseSelection(
    unwrapData(await requestJson(`/catalog/selection/${encodeURIComponent(id)}/`)),
  );
}

export async function registerUser(input: {
  email: string;
  password: string;
  username: string;
}) {
  const response = await requestJson('/user/signup/', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!isRecord(response) || response.success !== true) {
    throw new ApiError('Не удалось создать аккаунт.', 200);
  }

  return parseUser(response.result);
}

export async function loginUser(email: string, password: string) {
  const body = JSON.stringify({ email, password });
  const [userPayload, tokenPayload] = await Promise.all([
    requestJson('/user/login/', { method: 'POST', body }),
    requestJson('/user/token/', { method: 'POST', body }),
  ]);
  const session: AuthSession = {
    user: parseUser(userPayload),
    tokens: parseTokens(tokenPayload),
  };

  saveSession(session);
  return session;
}

async function requestAuthorized(path: string, init: RequestInit = {}) {
  const session = getSession();
  if (!session) {
    throw new ApiError('Войдите в аккаунт, чтобы продолжить.', 401);
  }

  try {
    return await requestJson(path, init, session.tokens.access);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }

  let access: string;
  try {
    const payload = await requestJson('/user/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: session.tokens.refresh }),
    });
    access = parseAccessToken(payload);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession();
      throw new ApiError('Сессия истекла. Войдите в аккаунт ещё раз.', 401);
    }
    throw error;
  }

  saveSession({
    ...session,
    tokens: { ...session.tokens, access },
  });

  try {
    return await requestJson(path, init, access);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) clearSession();
    throw error;
  }
}

export async function fetchFavoriteTracks() {
  return parseTrackList(
    unwrapData(await requestAuthorized('/catalog/track/favorite/all/')),
  );
}

export async function setTrackFavorite(trackId: number, isFavorite: boolean) {
  return requestAuthorized(`/catalog/track/${trackId}/favorite/`, {
    method: isFavorite ? 'DELETE' : 'POST',
  });
}
