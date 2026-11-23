import type { AuthSession, User } from '@/data';

const SESSION_KEY = 'music-session';
const SESSION_CHANGE_EVENT = 'music-session-change';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUser(value: unknown): value is User {
  return (
    isRecord(value) &&
    typeof value._id === 'number' &&
    typeof value.email === 'string' &&
    typeof value.username === 'string'
  );
}

function isSession(value: unknown): value is AuthSession {
  if (!isRecord(value) || !isRecord(value.tokens)) return false;

  return (
    isUser(value.user) &&
    typeof value.tokens.access === 'string' &&
    typeof value.tokens.refresh === 'string'
  );
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  const savedSession = window.localStorage.getItem(SESSION_KEY);
  if (!savedSession) return null;

  try {
    const parsed: unknown = JSON.parse(savedSession);
    if (isSession(parsed)) return parsed;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }

  window.localStorage.removeItem(SESSION_KEY);
  return null;
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function clearSession() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function subscribeToSessionChange(callback: () => void) {
  window.addEventListener(SESSION_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
