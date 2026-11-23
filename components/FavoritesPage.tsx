'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { Track, User } from '@/data';
import { fetchFavoriteTracks, setTrackFavorite } from '@/lib/api';
import { getSession, subscribeToSessionChange } from '@/lib/session';
import shellStyles from './MainPage.module.css';
import Nav from './Nav';
import styles from './CatalogPage.module.css';
import TrackRows from './TrackRows';

export default function FavoritesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [removingTrackIds, setRemovingTrackIds] = useState<number[]>([]);
  const [mutationError, setMutationError] = useState<{
    userId: number;
    message: string;
  } | null>(null);
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
  const favoriteMutationError =
    user && mutationError?.userId === user._id ? mutationError.message : null;

  useEffect(() => {
    const updateUser = () => {
      const nextUser = getSession()?.user ?? null;
      setUser((currentUser) =>
        currentUser?._id === nextUser?._id &&
        currentUser?.email === nextUser?.email
          ? currentUser
          : nextUser,
      );
      setIsSessionReady(true);
    };

    updateUser();
    return subscribeToSessionChange(updateUser);
  }, []);

  useEffect(() => {
    if (isSessionReady && !user) router.replace('/');
  }, [isSessionReady, router, user]);

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

  const removeFavorite = useCallback(
    async (track: Track) => {
      if (!user || removingTrackIds.includes(track._id)) return;

      setRemovingTrackIds((currentIds) => [...currentIds, track._id]);
      try {
        await setTrackFavorite(track._id, false);
        setRequest((currentRequest) => {
          if (
            !currentRequest ||
            currentRequest.userId !== user._id ||
            !currentRequest.tracks
          ) {
            return currentRequest;
          }

          return {
            ...currentRequest,
            tracks: currentRequest.tracks.filter(
              (currentTrack) => currentTrack._id !== track._id,
            ),
          };
        });
        setMutationError(null);
      } catch (requestError) {
        setMutationError({
          userId: user._id,
          message:
            requestError instanceof Error
              ? requestError.message
              : 'Не удалось убрать трек из избранного.',
        });
      } finally {
        setRemovingTrackIds((currentIds) =>
          currentIds.filter((id) => id !== track._id),
        );
      }
    },
    [removingTrackIds, user],
  );

  return (
    <div className={shellStyles.wrapper}>
      <div className={shellStyles.container}>
        <main className={shellStyles.main}>
          <Nav />
          <section className={styles.pageContent}>
            <h1 className={styles.pageHeading}>Мой плейлист</h1>
            {!isSessionReady && (
              <p className={styles.status}>Проверяем авторизацию…</p>
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
            {favoriteMutationError && (
              <div className={styles.error} role="alert">
                {favoriteMutationError}
              </div>
            )}
            {user && !isLoading && !error && tracks.length === 0 && (
              <p className={styles.status}>В избранном пока нет треков.</p>
            )}
            {user && !isLoading && !error && tracks.length > 0 && (
              <TrackRows
                tracks={tracks}
                onRemove={removeFavorite}
                removingTrackIds={removingTrackIds}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
