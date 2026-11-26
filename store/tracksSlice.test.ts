import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requestTracks } = vi.hoisted(() => ({
  requestTracks: vi.fn(),
}));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, fetchTracks: requestTracks };
});

import { tracks } from '@/test/trackFixtures';
import { makeStore } from './store';
import { loadTracks } from './tracksSlice';

describe('loadTracks thunk', () => {
  beforeEach(() => {
    requestTracks.mockReset();
  });

  it('stores the returned tracks and marks the request successful', async () => {
    requestTracks.mockResolvedValue(tracks);
    const store = makeStore();

    const request = store.dispatch(loadTracks());
    expect(store.getState().tracks.status).toBe('loading');

    await request;

    expect(store.getState().tracks.items).toEqual(tracks);
    expect(store.getState().tracks.status).toBe('succeeded');
    expect(store.getState().tracks.error).toBeNull();
  });

  it('stores the API error when the request fails', async () => {
    requestTracks.mockRejectedValue(new Error('API is unavailable'));
    const store = makeStore();

    await store.dispatch(loadTracks());

    expect(store.getState().tracks.status).toBe('failed');
    expect(store.getState().tracks.error).toBe('API is unavailable');
  });
});
