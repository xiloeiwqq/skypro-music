import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TrackSort from './TrackSort';

describe('TrackSort', () => {
  it('changes the selected sort order', () => {
    const onChange = vi.fn();
    render(<TrackSort value="default" onChange={onChange} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Сортировать треки' }), {
      target: { value: 'year-desc' },
    });

    expect(onChange).toHaveBeenCalledWith('year-desc');
  });
});
