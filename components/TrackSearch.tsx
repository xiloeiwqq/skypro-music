'use client';

import styles from './TrackList.module.css';

type TrackSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function TrackSearch({ value, onChange }: TrackSearchProps) {
  return (
    <div className={styles.search}>
      <svg className={styles.searchSvg} aria-hidden="true">
        <use href="/img/icon/sprite.svg#icon-search" />
      </svg>
      <input
        className={styles.searchText}
        type="search"
        placeholder="Поиск"
        name="search"
        aria-label="Поиск треков"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </div>
  );
}
