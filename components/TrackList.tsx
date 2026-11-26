'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './TrackList.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTrack, setIsPlaying } from '@/store/playerSlice';
import { fetchTracks, setFilter, setSearchTerm } from '@/store/tracksSlice';
import type { Track } from '@/lib/types';

type FilterKey = 'author' | 'year' | 'genre';

const filterLabels: Record<FilterKey, string> = {
  author: 'исполнителю',
  year: 'году выпуска',
  genre: 'жанру',
};

function Icon({ name, className }: { name: string; className: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/img/icon/sprite.svg#icon-${name}`} />
    </svg>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function getFilterOptions(tracks: Track[], key: FilterKey) {
  const values = tracks.flatMap((track) => {
    if (key === 'author') return [track.author];
    if (key === 'year') return [track.release_date.slice(0, 4)];
    return track.genre;
  });
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  );
}

export default function TrackList() {
  const dispatch = useAppDispatch();
  const { items, status, error, searchTerm, filters } = useAppSelector(
    (state) => state.tracks,
  );
  const [openedFilter, setOpenedFilter] = useState<FilterKey | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchTracks());
    }
  }, [dispatch, status]);

  const options = useMemo(
    () => ({
      author: getFilterOptions(items, 'author'),
      year: getFilterOptions(items, 'year'),
      genre: getFilterOptions(items, 'genre'),
    }),
    [items],
  );

  const visibleTracks = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('ru');
    return items.filter((track) => {
      const matchesSearch =
        !query ||
        [track.name, track.author, track.album].some((value) =>
          value.toLocaleLowerCase('ru').includes(query),
        );
      return (
        matchesSearch &&
        (!filters.author || track.author === filters.author) &&
        (!filters.year || track.release_date.startsWith(filters.year)) &&
        (!filters.genre || track.genre.includes(filters.genre))
      );
    });
  }, [filters, items, searchTerm]);

  const playTrack = (track: Track) => {
    dispatch(setCurrentTrack(track));
    dispatch(setIsPlaying(true));
  };

  return (
    <section className={styles.centerblock} aria-labelledby="tracks-heading">
      <div className={styles.search}>
        <Icon name="search" className={styles.searchSvg} />
        <input
          className={styles.searchText}
          type="search"
          placeholder="Поиск"
          name="search"
          aria-label="Поиск треков"
          value={searchTerm}
          onChange={(event) => dispatch(setSearchTerm(event.target.value))}
        />
      </div>
      <h1 className={styles.heading} id="tracks-heading">
        Треки
      </h1>
      <div className={styles.filter}>
        <span className={styles.filterTitle}>Искать по:</span>
        {(['author', 'year', 'genre'] as const).map((key) => (
          <div className={styles.filterControl} key={key}>
            <button
              className={`${styles.filterButton} ${filters[key] ? styles.filterSelected : ''}`}
              type="button"
              aria-expanded={openedFilter === key}
              onClick={() =>
                setOpenedFilter((current) => (current === key ? null : key))
              }
            >
              {filters[key] || filterLabels[key]}
            </button>
            {openedFilter === key && (
              <div className={styles.filterOptions} role="group" aria-label={filterLabels[key]}>
                <button
                  type="button"
                  className={styles.filterOption}
                  onClick={() => {
                    dispatch(setFilter({ key, value: '' }));
                    setOpenedFilter(null);
                  }}
                >
                  Все
                </button>
                {options[key].map((value) => (
                  <button
                    type="button"
                    className={styles.filterOption}
                    key={value}
                    onClick={() => {
                      dispatch(setFilter({ key, value }));
                      setOpenedFilter(null);
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.content}>
        <div className={styles.contentTitle}>
          <span className={`${styles.titleCol} ${styles.col01}`}>Трек</span>
          <span className={`${styles.titleCol} ${styles.col02}`}>
            Исполнитель
          </span>
          <span className={`${styles.titleCol} ${styles.col03}`}>Альбом</span>
          <span className={`${styles.titleCol} ${styles.col04}`}>
            <Icon name="watch" className={styles.titleSvg} />
          </span>
        </div>
        <div className={styles.playlist}>
          {status === 'loading' && (
            <p className={styles.listMessage}>Загружаем треки...</p>
          )}
          {status === 'failed' && (
            <div className={styles.listMessage} role="alert">
              <p>{error}</p>
              <button
                className={styles.retryButton}
                type="button"
                onClick={() => void dispatch(fetchTracks())}
              >
                Повторить
              </button>
            </div>
          )}
          {status === 'succeeded' && visibleTracks.length === 0 && (
            <p className={styles.listMessage}>Треки не найдены</p>
          )}
          {status === 'succeeded' &&
            visibleTracks.map((track) => (
              <div className={styles.playlistItem} key={track._id}>
                <div className={styles.playlistTrack}>
                  <div className={styles.trackTitle}>
                    <div className={styles.trackTitleImage}>
                      <Icon name="note" className={styles.trackTitleSvg} />
                    </div>
                    <div>
                      <button
                        className={`${styles.trackTitleLink} ${styles.trackSelect}`}
                        type="button"
                        onClick={() => playTrack(track)}
                      >
                        {track.name}
                      </button>
                    </div>
                  </div>
                  <div className={styles.trackAuthor}>{track.author}</div>
                  <div className={styles.trackAlbum}>{track.album}</div>
                  <div className={styles.trackTime}>
                    <Icon name="like" className={styles.trackTimeSvg} />
                    <span className={styles.trackTimeText}>
                      {formatDuration(track.duration_in_seconds)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
