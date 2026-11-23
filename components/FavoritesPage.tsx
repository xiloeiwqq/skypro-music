'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Track, User } from '@/data';
import { fetchFavoriteTracks } from '@/lib/api';
import { getSession, subscribeToSessionChange } from '@/lib/session';
import shellStyles from './MainPage.module.css';
import Nav from './Nav';
import styles from './CatalogPage.module.css';
import TrackRows from './TrackRows';

export default function FavoritesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [request, setRequest] = useState<{
    userId: number;
    attempt: number;
    tracks?: Track[];
    error?: string;
  } | null>(null);
  const isLoading =
    !!user &&
    (request?.userId !== user._id || request.attempt !== reloadCount);
  const tracks =
    user && request?.userId === user._id ? (request.tracks ?? []) : [];
  const error =
    user && request?.userId === user._id ? (request.error ?? null) : null;

  useEffect(() => {
    const updateUser = () => setUser(getSession()?.user ?? null);
    updateUser();
    return subscribeToSessionChange(updateUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    let active = true;
    fetchFavoriteTracks()
      .then((result) => {
        if (active) {
          setRequest({
            userId: user._id,
            attempt: reloadCount,
            tracks: result,
          });
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setRequest({
            userId: user._id,
            attempt: reloadCount,
            error:
              requestError instanceof Error
                ? requestError.message
                : 'Не удалось загрузить избранные треки.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [reloadCount, user]);

  return (
    <div className={shellStyles.wrapper}>
      <div className={shellStyles.container}>
        <main className={shellStyles.main}>
          <Nav />
          <section className={styles.pageContent}>
            <h1 className={styles.pageHeading}>Мой плейлист</h1>
            {!user && (
              <p className={styles.status}>
                <Link href="/signin">Войдите</Link>, чтобы просмотреть избранные
                треки.
              </p>
            )}
            {isLoading && <p className={styles.status}>Загружаем избранное…</p>}
            {error && (
              <div className={styles.error} role="alert">
                {error}
                <button
                  className={styles.retryButton}
                  type="button"
                  onClick={() => setReloadCount((count) => count + 1)}
                >
                  Повторить запрос
                </button>
              </div>
            )}
            {user && !isLoading && !error && tracks.length === 0 && (
              <p className={styles.status}>В избранном пока нет треков.</p>
            )}
            {user && !isLoading && !error && tracks.length > 0 && (
              <TrackRows tracks={tracks} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
