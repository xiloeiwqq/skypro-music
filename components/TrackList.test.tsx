import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { makeStore } from '@/store/store';
import { setTrackItems } from '@/store/tracksSlice';
import TrackList from './TrackList';
import { tracks } from '@/test/trackFixtures';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('TrackList', () => {
  it('combines search, author and genre filters and sorts the playlist', async () => {
    const onPlaylistChange = vi.fn();
    const store = makeStore();
    store.dispatch(setTrackItems(tracks));
    render(
      <Provider store={store}>
        <TrackList
          currentTrackId={null}
          isPlaying={false}
          onSelectTrack={vi.fn()}
          onPlaylistChange={onPlaylistChange}
          favoriteTrackIds={[]}
          favoriteLoadingIds={[]}
          onFavoriteChange={vi.fn()}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'исполнителю' }));
    fireEvent.click(screen.getByRole('option', { name: 'Alpha' }));
    fireEvent.click(screen.getByRole('button', { name: 'жанру' }));
    fireEvent.click(screen.getByRole('option', { name: 'rock' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Поиск треков' }), {
      target: { value: 'zEbRa' },
    });

    expect(
      screen.getByRole('button', { name: /Воспроизвести: Zebra/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Воспроизвести: Apple/ }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(onPlaylistChange).toHaveBeenLastCalledWith([tracks[0]]));

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Поиск треков' }), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Сортировать треки' }), {
      target: { value: 'title-asc' },
    });
    expect(screen.getByRole('combobox', { name: 'Сортировать треки' })).toHaveValue(
      'title-asc',
    );
    await waitFor(() =>
      expect(onPlaylistChange).toHaveBeenLastCalledWith([
        tracks[1],
        tracks[2],
        tracks[3],
        tracks[0],
      ]),
    );
  });
});
