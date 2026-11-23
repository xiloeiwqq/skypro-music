'use client';

import type { TrackSortOption } from '@/lib/trackFilters';
import styles from './TrackList.module.css';

type TrackSortProps = {
  value: TrackSortOption;
  onChange: (value: TrackSortOption) => void;
};

const sortOptions: Array<{ value: TrackSortOption; label: string }> = [
  { value: 'default', label: 'Порядок плейлиста' },
  { value: 'title-asc', label: 'Название: А–Я' },
  { value: 'title-desc', label: 'Название: Я–А' },
  { value: 'author-asc', label: 'Исполнитель: А–Я' },
  { value: 'author-desc', label: 'Исполнитель: Я–А' },
  { value: 'year-desc', label: 'Сначала новые' },
  { value: 'year-asc', label: 'Сначала старые' },
];

export default function TrackSort({ value, onChange }: TrackSortProps) {
  return (
    <label className={styles.sortControl}>
      <span>Сортировка:</span>
      <select
        className={styles.sortSelect}
        aria-label="Сортировать треки"
        value={value}
        onChange={(event) => {
          const option = sortOptions.find(
            (item) => item.value === event.currentTarget.value,
          );
          if (option) onChange(option.value);
        }}
      >
        {sortOptions.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
