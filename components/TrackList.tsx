'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { data, type Track } from '@/data';
import styles from './TrackList.module.css';

type FilterType = 'author' | 'year' | 'genre';
type SelectedFilter = { type: FilterType; value: string } | null;

type TrackListProps = {
  currentTrackId: Track['_id'] | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
};

function Icon({ name, className }: { name: string; className: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/img/icon/sprite.svg#icon-${name}`} />
    </svg>
  );
}

export default function TrackList({
  currentTrackId,
  isPlaying,
  onSelectTrack,
}: TrackListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>(null);
  const [search, setSearch] = useState('');

  const filterOptions = useMemo(
    () => ({
      author: [...new Set(data.map((track) => track.author))].sort((a, b) =>
        a.localeCompare(b, 'ru'),
      ),
      year: [
        ...new Set(data.map((track) => track.release_date.slice(0, 4))),
      ].sort((a, b) => Number(b) - Number(a)),
      genre: [
        ...new Set(data.flatMap((track) => track.genre)),
      ].sort((a, b) => a.localeCompare(b, 'ru')),
    }),
    [],
  );

  const visibleTracks = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('ru');

    return data.filter((track) => {
      const matchesSearch =
        !normalizedSearch ||
        [track.name, track.author, track.album].some((value) =>
          value.toLocaleLowerCase('ru').includes(normalizedSearch),
        );
      const matchesFilter =
        !selectedFilter ||
        (selectedFilter.type === 'author' &&
          track.author === selectedFilter.value) ||
        (selectedFilter.type === 'year' &&
          track.release_date.startsWith(selectedFilter.value)) ||
        (selectedFilter.type === 'genre' &&
          track.genre.includes(selectedFilter.value));

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedFilter]);

  const toggleFilter = (filter: FilterType) => {
    setActiveFilter((current) => (current === filter ? null : filter));
  };

  const selectFilter = (type: FilterType, value: string) => {
    setSelectedFilter((current) =>
      current?.type === type && current.value === value
        ? null
        : { type, value },
    );
    setActiveFilter(null);
  };

  const filterLabels: Record<FilterType, string> = {
    author: 'исполнителю',
    year: 'году выпуска',
    genre: 'жанру',
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
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <h1 className={styles.heading} id="tracks-heading">
        Треки
      </h1>
      <div className={styles.filter}>
        <span className={styles.filterTitle}>Искать по:</span>
        {(Object.keys(filterLabels) as FilterType[]).map((filter) => (
          <div className={styles.filterOptionGroup} key={filter}>
            <button
              className={`${styles.filterButton} ${
                activeFilter === filter ? styles.active : ''
              }`}
              type="button"
              aria-expanded={activeFilter === filter}
              aria-haspopup="listbox"
              onClick={() => toggleFilter(filter)}
            >
              {filterLabels[filter]}
            </button>
            {activeFilter === filter && (
              <div className={styles.filterList} role="listbox">
                {filterOptions[filter].map((option) => (
                  <button
                    className={styles.filterOption}
                    type="button"
                    role="option"
                    aria-selected={
                      selectedFilter?.type === filter &&
                      selectedFilter.value === option
                    }
                    key={option}
                    onClick={() => selectFilter(filter, option)}
                  >
                    {option}
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
          {visibleTracks.length === 0 && (
            <p className={styles.emptyState}>Треки не найдены</p>
          )}
          {visibleTracks.map((track) => (
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
                  <Icon name="like" className={styles.trackTimeSvg} />
                  <span className={styles.trackTimeText}>
                    {Math.floor(track.duration_in_seconds / 60)}:
                    {String(track.duration_in_seconds % 60).padStart(2, '0')}
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
