'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Track } from '@/data';
import {
  getTrackFilterOptions,
  getVisibleTracks,
  type TrackFilterKey,
  type TrackFilterSelection,
  type TrackSortOption,
} from '@/lib/trackFilters';
import styles from './TrackList.module.css';
import TrackFilters from './TrackFilters';
import TrackSearch from './TrackSearch';
import TrackSort from './TrackSort';

type TrackListProps = {
  tracks: Track[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  currentTrackId: Track['_id'] | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onPlaylistChange: (tracks: Track[]) => void;
  favoriteTrackIds: number[];
  favoriteLoadingIds: number[];
  onFavoriteChange: (track: Track, shouldBeFavorite: boolean) => void;
};

function Icon({ name, className }: { name: string; className: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/img/icon/sprite.svg#icon-${name}`} />
    </svg>
  );
}

export default function TrackList({
  tracks,
  isLoading,
  error,
  onRetry,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onPlaylistChange,
  favoriteTrackIds,
  favoriteLoadingIds,
  onFavoriteChange,
}: TrackListProps) {
  const [activeFilter, setActiveFilter] = useState<TrackFilterKey | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<TrackFilterSelection>({
    author: null,
    year: null,
    genre: null,
  });
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<TrackSortOption>('default');

  const filterOptions = useMemo(() => getTrackFilterOptions(tracks), [tracks]);

  const visibleTracks = useMemo(() => {
    return getVisibleTracks(tracks, search, selectedFilters, sortOption);
  }, [search, selectedFilters, sortOption, tracks]);

  useEffect(() => {
    onPlaylistChange(visibleTracks);
  }, [onPlaylistChange, visibleTracks]);

  const toggleFilter = useCallback((filter: TrackFilterKey) => {
    setActiveFilter((current) => (current === filter ? null : filter));
  }, []);

  const selectFilter = useCallback(
    (filter: TrackFilterKey, value: string) => {
      setSelectedFilters((current) => ({
        ...current,
        [filter]: current[filter] === value ? null : value,
      }));
      setActiveFilter(null);
    },
    [],
  );
  const clearFilters = useCallback(() => {
    setSelectedFilters({ author: null, year: null, genre: null });
  }, []);

  return (
    <section className={styles.centerblock} aria-labelledby="tracks-heading">
      <TrackSearch value={search} onChange={setSearch} />
      <h1 className={styles.heading} id="tracks-heading">
        Треки
      </h1>
      <div className={styles.filterControls}>
        <TrackFilters
          options={filterOptions}
          selected={selectedFilters}
          activeFilter={activeFilter}
          onToggle={toggleFilter}
          onSelect={selectFilter}
          onClear={clearFilters}
        />
        <TrackSort value={sortOption} onChange={setSortOption} />
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
          {isLoading && <p className={styles.emptyState}>Загружаем треки…</p>}
          {!isLoading && error && (
            <div className={styles.requestError} role="alert">
              <p>{error}</p>
              <button
                className={styles.retryButton}
                type="button"
                onClick={onRetry}
              >
                Повторить запрос
              </button>
            </div>
          )}
          {!isLoading && !error && visibleTracks.length === 0 && (
            <p className={styles.emptyState}>Треки не найдены</p>
          )}
          {!isLoading &&
            !error &&
            visibleTracks.map((track) => {
              const isFavorite = favoriteTrackIds.includes(track._id);
              const favoriteCount = track.staredUser?.length ?? 0;

              return (
                <div className={styles.playlistItem} key={track._id}>
                  <div
                    className={`${styles.playlistTrack} ${
                      currentTrackId === track._id ? styles.currentTrack : ''
                    }`}
                  >
                    <div className={styles.trackTitle}>
                      <div className={styles.trackTitleImage}>
                        <Icon name="note" className={styles.trackTitleSvg} />
                      </div>
                      <div>
                        <button
                          className={styles.trackTitleLink}
                          type="button"
                          aria-current={
                            currentTrackId === track._id ? 'true' : undefined
                          }
                          aria-label={`Воспроизвести: ${track.name}, ${track.author}`}
                          onClick={() => onSelectTrack(track)}
                        >
                          {track.name}
                          {currentTrackId === track._id && (
                            <span className={styles.playingStatus}>
                              {isPlaying ? 'Сейчас играет' : 'На паузе'}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className={styles.trackAuthor}>
                      <Link href="#" className={styles.trackAuthorLink}>
                        {track.author}
                      </Link>
                    </div>
                    <div className={styles.trackAlbum}>
                      <Link href="#" className={styles.trackAlbumLink}>
                        {track.album}
                      </Link>
                    </div>
                    <div className={styles.trackTime}>
                      <button
                        className={`${styles.favoriteButton} ${
                          isFavorite ? styles.favoriteActive : ''
                        }`}
                        type="button"
                        aria-label={
                          `${isFavorite ? 'Убрать' : 'Добавить'} ${track.name} ` +
                          `в избранное; лайков: ${favoriteCount}`
                        }
                        aria-pressed={isFavorite}
                        disabled={favoriteLoadingIds.includes(track._id)}
                        onClick={() =>
                          onFavoriteChange(track, !isFavorite)
                        }
                      >
                        <Icon name="like" className={styles.trackTimeSvg} />
                        <span className={styles.favoriteCount}>
                          {favoriteCount}
                        </span>
                      </button>
                      <span className={styles.trackTimeText}>
                        {Math.floor(track.duration_in_seconds / 60)}:
                        {String(track.duration_in_seconds % 60).padStart(
                          2,
                          '0',
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
