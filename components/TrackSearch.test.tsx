import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TrackSearch from './TrackSearch';

describe('TrackSearch', () => {
  it('displays the current query and reports edits', () => {
    const onChange = vi.fn();
    render(<TrackSearch value="night" onChange={onChange} />);

    const search = screen.getByRole('searchbox', { name: 'Поиск треков' });
    expect(search).toHaveValue('night');

    fireEvent.change(search, { target: { value: 'rock' } });
    expect(onChange).toHaveBeenCalledWith('rock');
  });
});
