'use client';

import type {
  TrackFilterKey,
  TrackFilterOptions,
  TrackFilterSelection,
} from '@/lib/trackFilters';
import styles from './TrackList.module.css';

type TrackFiltersProps = {
  options: TrackFilterOptions;
  selected: TrackFilterSelection;
  activeFilter: TrackFilterKey | null;
  onToggle: (filter: TrackFilterKey) => void;
  onSelect: (filter: TrackFilterKey, value: string) => void;
  onClear: () => void;
};

const filterLabels: Record<TrackFilterKey, string> = {
  author: 'исполнителю',
  year: 'году выпуска',
  genre: 'жанру',
};

const filterOrder: TrackFilterKey[] = ['author', 'year', 'genre'];

export default function TrackFilters({
  options,
  selected,
  activeFilter,
  onToggle,
  onSelect,
  onClear,
}: TrackFiltersProps) {
  const hasSelection = filterOrder.some((filter) => selected[filter] !== null);

  return (
    <div className={styles.filter}>
      <span className={styles.filterTitle}>Искать по:</span>
      {filterOrder.map((filter) => (
        <div className={styles.filterOptionGroup} key={filter}>
          <button
            className={`${styles.filterButton} ${
              activeFilter === filter || selected[filter] ? styles.active : ''
            }`}
            type="button"
            aria-expanded={activeFilter === filter}
            aria-haspopup="listbox"
            onClick={() => onToggle(filter)}
          >
            {filterLabels[filter]}
            {selected[filter] ? `: ${selected[filter]}` : ''}
          </button>
          {activeFilter === filter && (
            <div
              className={styles.filterList}
              role="listbox"
              aria-label={`Фильтр по ${filterLabels[filter]}`}
            >
              {options[filter].map((option) => (
                <button
                  className={styles.filterOption}
                  type="button"
                  role="option"
                  aria-selected={selected[filter] === option}
                  key={option}
                  onClick={() => onSelect(filter, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {hasSelection && (
        <button
          className={styles.clearFilters}
          type="button"
          onClick={onClear}
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}
