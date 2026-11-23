'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Selection, Track } from '@/data';
import { fetchSelection, fetchTracks } from '@/lib/api';
import shellStyles from './MainPage.module.css';
import Nav from './Nav';
import styles from './CatalogPage.module.css';
import TrackRows from './TrackRows';

export default function CollectionDetails() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [selection, setSelection] = useState<Selection | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([fetchSelection(id), fetchTracks()])
      .then(([result, allTracks]) => {
        if (!active) return;
        const tracksById = new Map(allTracks.map((track) => [track._id, track]));
        setSelection(result);
        setTracks(
          result.items.flatMap((trackId) => {
            const track = tracksById.get(trackId);
            return track ? [track] : [];
          }),
        );
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Не удалось загрузить подборку.',
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, reloadCount]);

  return (
    <div className={shellStyles.wrapper}>
      <div className={shellStyles.container}>
        <main className={shellStyles.main}>
          <Nav />
          <section className={styles.pageContent}>
            <Link className={styles.backLink} href="/collections">
              ← Все подборки
            </Link>
            {isLoading && <p className={styles.status}>Загружаем подборку…</p>}
            {error && (
              <div className={styles.error} role="alert">
                {error}
                <button
                  className={styles.retryButton}
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setError(null);
                    setReloadCount((count) => count + 1);
                  }}
                >
                  Повторить запрос
                </button>
              </div>
            )}
            {!isLoading && !error && selection && (
              <>
                <h1 className={styles.pageHeading}>
                  {selection.name ?? 'Подборка'}
                </h1>
                <p className={styles.collectionDescription}>
                  {tracks.length} треков
                </p>
                {tracks.length > 0 ? (
                  <TrackRows tracks={tracks} />
                ) : (
                  <p className={styles.status}>
                    В этой подборке пока нет доступных треков.
                  </p>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
