import { describe, expect, it } from 'vitest';
import {
  filterTracks,
  getTrackFilterOptions,
  getVisibleTracks,
  sortTracks,
  type TrackFilterSelection,
} from '@/lib/trackFilters';
import { tracks } from './trackFixtures';

const noFilters: TrackFilterSelection = {
  author: null,
  year: null,
  genre: null,
};

describe('getTrackFilterOptions', () => {
  it('returns unique, sorted options and ignores missing years', () => {
    expect(getTrackFilterOptions(tracks)).toEqual({
      author: ['Alpha', 'Beta'],
      year: ['2024', '2023', '2022'],
      genre: ['ambient', 'indie', 'pop', 'rock'],
    });
  });
});

describe('filterTracks', () => {
  it('combines case-insensitive search with author, year, and genre filters', () => {
    const filtered = filterTracks(tracks, '  zEbRa ', {
      author: 'Alpha',
      year: '2024',
      genre: 'rock',
    });

    expect(filtered).toEqual([tracks[0]]);
  });

  it('matches track metadata and does not mutate the source list', () => {
    const filtered = filterTracks(tracks, 'night', noFilters);

    expect(filtered).toEqual([tracks[0], tracks[2]]);
    expect(tracks.map((track) => track._id)).toEqual([1, 2, 3, 4]);
  });
});

describe('sortTracks', () => {
  it.each([
    ['default', [1, 2, 3, 4]],
    ['title-asc', [2, 3, 4, 1]],
    ['title-desc', [1, 4, 3, 2]],
    ['author-asc', [1, 2, 3, 4]],
    ['author-desc', [3, 4, 1, 2]],
    ['year-desc', [1, 3, 2, 4]],
    ['year-asc', [2, 3, 1, 4]],
  ] as const)('sorts using %s without mutating the source', (option, ids) => {
    expect(sortTracks(tracks, option).map((track) => track._id)).toEqual(ids);
    expect(tracks.map((track) => track._id)).toEqual([1, 2, 3, 4]);
  });
});

describe('getVisibleTracks', () => {
  it('filters first and then sorts the combined result', () => {
    expect(
      getVisibleTracks(
        tracks,
        '',
        { author: 'Alpha', year: null, genre: null },
        'title-asc',
      ).map((track) => track._id),
    ).toEqual([2, 1]);
  });
});
