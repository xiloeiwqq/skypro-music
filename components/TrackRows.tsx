import Link from 'next/link';
import type { Track } from '@/data';
import styles from './CatalogPage.module.css';

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function TrackRows({ tracks }: { tracks: Track[] }) {
  return (
    <ul className={styles.trackRows}>
      {tracks.map((track) => (
        <li key={track._id}>
          <Link className={styles.trackRow} href={`/?track=${track._id}`}>
            <span>{track.name}</span>
            <span className={styles.trackAuthor}>{track.author}</span>
            <span className={styles.trackAlbum}>{track.album}</span>
            <span className={styles.trackDuration}>
              {formatDuration(track.duration_in_seconds)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
