import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  TrackFilterOptions,
  TrackFilterSelection,
} from '@/lib/trackFilters';
import TrackFilters from './TrackFilters';

const options: TrackFilterOptions = {
  author: ['Alpha', 'Beta'],
  year: ['2024', '2023'],
  genre: ['pop', 'rock'],
};

const selected: TrackFilterSelection = {
  author: 'Alpha',
  year: null,
  genre: 'rock',
};

describe('TrackFilters', () => {
  it('shows one active category and reports selections and clearing', () => {
    const onToggle = vi.fn();
    const onSelect = vi.fn();
    const onClear = vi.fn();
    const props = {
      options,
      selected,
      onToggle,
      onSelect,
      onClear,
    };
    const { rerender } = render(
      <TrackFilters {...props} activeFilter="author" />,
    );

    expect(screen.getAllByRole('listbox')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'жанру: rock' }));
    expect(onToggle).toHaveBeenCalledWith('genre');

    rerender(<TrackFilters {...props} activeFilter="genre" />);
    expect(screen.getAllByRole('listbox')).toHaveLength(1);
    fireEvent.click(screen.getByRole('option', { name: 'pop' }));
    expect(onSelect).toHaveBeenCalledWith('genre', 'pop');

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
