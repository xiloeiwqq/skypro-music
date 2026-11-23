import type { Track } from '@/data';

export type TrackFilterKey = 'author' | 'year' | 'genre';

export type TrackFilterSelection = Record<TrackFilterKey, string | null>;

export type TrackFilterOptions = Record<TrackFilterKey, string[]>;

export type TrackSortOption =
  | 'default'
  | 'title-asc'
  | 'title-desc'
  | 'author-asc'
  | 'author-desc'
  | 'year-desc'
  | 'year-asc';

function compareText(left: string, right: string) {
  return left.localeCompare(right, 'ru', {
    numeric: true,
    sensitivity: 'base',
  });
}

function trackYear(track: Track) {
  const year = Number(track.release_date.slice(0, 4));
  return Number.isFinite(year) ? year : 0;
}

export function getTrackFilterOptions(tracks: Track[]): TrackFilterOptions {
  return {
    author: [...new Set(tracks.map((track) => track.author))].sort(compareText),
    year: [
      ...new Set(
        tracks
          .map((track) => track.release_date.slice(0, 4))
          .filter((year) => /^\d{4}$/.test(year)),
      ),
    ].sort((left, right) => Number(right) - Number(left)),
    genre: [
      ...new Set(tracks.flatMap((track) => track.genre)),
    ].sort(compareText),
  };
}

export function filterTracks(
  tracks: Track[],
  search: string,
  filters: TrackFilterSelection,
): Track[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru');

  return tracks.filter((track) => {
    const matchesSearch =
      !normalizedSearch ||
      [track.name, track.author, track.album, ...track.genre].some((value) =>
        value.toLocaleLowerCase('ru').includes(normalizedSearch),
      );
    const matchesAuthor = !filters.author || track.author === filters.author;
    const matchesYear =
      !filters.year || track.release_date.startsWith(filters.year);
    const matchesGenre = !filters.genre || track.genre.includes(filters.genre);

    return matchesSearch && matchesAuthor && matchesYear && matchesGenre;
  });
}

export function sortTracks(
  tracks: Track[],
  sortOption: TrackSortOption,
): Track[] {
  const sortedTracks = [...tracks];
  const compareByYear = (left: Track, right: Track, direction: 1 | -1) => {
    const leftYear = trackYear(left);
    const rightYear = trackYear(right);

    if (!leftYear || !rightYear) {
      if (!leftYear && !rightYear) return 0;
      return leftYear ? -1 : 1;
    }

    return (leftYear - rightYear) * direction;
  };

  switch (sortOption) {
    case 'title-asc':
      return sortedTracks.sort((left, right) =>
        compareText(left.name, right.name),
      );
    case 'title-desc':
      return sortedTracks.sort((left, right) =>
        compareText(right.name, left.name),
      );
    case 'author-asc':
      return sortedTracks.sort((left, right) =>
        compareText(left.author, right.author),
      );
    case 'author-desc':
      return sortedTracks.sort((left, right) =>
        compareText(right.author, left.author),
      );
    case 'year-desc':
      return sortedTracks.sort((left, right) =>
        compareByYear(left, right, -1),
      );
    case 'year-asc':
      return sortedTracks.sort((left, right) =>
        compareByYear(left, right, 1),
      );
    default:
      return sortedTracks;
  }
}

export function getVisibleTracks(
  tracks: Track[],
  search: string,
  filters: TrackFilterSelection,
  sortOption: TrackSortOption,
): Track[] {
  return sortTracks(filterTracks(tracks, search, filters), sortOption);
}
