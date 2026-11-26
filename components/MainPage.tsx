'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Track } from '@/data';
import {
  fetchFavoriteTracks,
  setTrackFavorite,
} from '@/lib/api';
import { getSession, subscribeToSessionChange } from '@/lib/session';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/authSlice';
import { loadTracks, updateTrackFavorite } from '@/store/tracksSlice';
import {
  setCurrentPlaylist,
  setCurrentTime,
  setCurrentTrack,
  setDuration,
  setIsLoop,
  setIsPlaying,
  setIsShuffle,
  setPlaybackError,
  setVolume,
  updateCurrentTrackFavorite,
} from '@/store/playerSlice';
import styles from './MainPage.module.css';
import Nav from './Nav';
import PlayerBar from './PlayerBar';
import Sidebar from './Sidebar';
import TrackList from './TrackList';

export default function MainPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestedTrackId = useRef<string | null>(null);
  const favoriteMutationVersion = useRef(0);
  const dispatch = useAppDispatch();
  const { items: tracks, status: tracksStatus } = useAppSelector(
    (state) => state.tracks,
  );
  const {
    currentTrack,
    currentPlaylist,
    isPlaying,
    isLoop,
    isShuffle,
    volume,
    currentTime,
    duration,
    playbackError,
  } = useAppSelector((state) => state.player);
  const user = useAppSelector((state) => state.auth.user);
  const [favoriteData, setFavoriteData] = useState<{
    userId: number;
    ids: number[];
  } | null>(null);
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<number[]>([]);
  const [favoritesRequestError, setFavoritesRequestError] = useState<{
    userId: number | null;
    message: string;
  } | null>(null);
  const favoriteTrackIds = useMemo(
    () => {
      if (!user) return [];
      if (favoriteData?.userId === user._id) return favoriteData.ids;

      return tracks
        .filter((track) => track.staredUser?.includes(user._id))
        .map((track) => track._id);
    },
    [favoriteData, tracks, user],
  );
  const favoritesError = useMemo(
    () =>
      favoritesRequestError?.userId === (user?._id ?? null)
        ? favoritesRequestError.message
        : null,
    [favoritesRequestError, user],
  );

  useEffect(() => {
    if (tracksStatus === 'idle') void dispatch(loadTracks());
  }, [dispatch, tracksStatus]);

  useEffect(() => {
    const updateUser = () => {
      const nextUser = getSession()?.user ?? null;
      dispatch(setUser(nextUser));
    };

    updateUser();
    return subscribeToSessionChange(updateUser);
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const requestVersion = favoriteMutationVersion.current;
    fetchFavoriteTracks()
      .then((favorites) => {
        if (!active || requestVersion !== favoriteMutationVersion.current) return;
        setFavoriteData({
          userId: user._id,
          ids: favorites.map((track) => track._id),
        });
        setFavoritesRequestError(null);
      })
      .catch((error: unknown) => {
        if (!active || requestVersion !== favoriteMutationVersion.current) return;
        setFavoritesRequestError({
          userId: user._id,
          message:
            error instanceof Error
              ? error.message
              : 'Не удалось загрузить избранные треки.',
        });
      });

    return () => {
      active = false;
    };
  }, [user]);

  const changeFavorite = useCallback(
    async (track: Track, shouldBeFavorite: boolean) => {
      if (!user) {
        setFavoritesRequestError({
          userId: null,
          message: 'Войдите в аккаунт, чтобы сохранять избранные треки.',
        });
        return;
      }

      const isFavorite = favoriteTrackIds.includes(track._id);
      if (isFavorite === shouldBeFavorite) return;
      setFavoriteLoadingIds((currentIds) => [...currentIds, track._id]);
      setFavoritesRequestError(null);

      try {
        await setTrackFavorite(track._id, shouldBeFavorite);
        favoriteMutationVersion.current += 1;
        setFavoriteData((currentData) => {
          const currentIds =
            currentData?.userId === user._id
              ? currentData.ids
              : tracks
                  .filter((item) => item.staredUser?.includes(user._id))
                  .map((item) => item._id);
          const updatedIds = currentIds.filter((id) => id !== track._id);

          return {
            userId: user._id,
            ids: shouldBeFavorite ? [...updatedIds, track._id] : updatedIds,
          };
        });
        dispatch(
          updateTrackFavorite({
            trackId: track._id,
            userId: user._id,
            shouldBeFavorite,
          }),
        );
        dispatch(
          updateCurrentTrackFavorite({
            trackId: track._id,
            userId: user._id,
            shouldBeFavorite,
          }),
        );
      } catch (error) {
        setFavoritesRequestError({
          userId: user._id,
          message:
            error instanceof Error
              ? error.message
              : 'Не удалось изменить избранное.',
        });
      } finally {
        setFavoriteLoadingIds((currentIds) =>
          currentIds.filter((id) => id !== track._id),
        );
      }
    },
    [dispatch, favoriteTrackIds, tracks, user],
  );

  const startPlayback = useCallback(async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      dispatch(setPlaybackError(null));
    } catch {
      dispatch(setIsPlaying(false));
      dispatch(setPlaybackError(
        'Не удалось воспроизвести трек. Проверьте подключение и повторите попытку.',
      ));
    }
  }, [dispatch]);

  const selectTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?._id === track._id) {
      if (audio.paused) {
        void startPlayback(audio);
      } else {
        audio.pause();
      }
      return;
    }

    dispatch(setCurrentTrack(track));
    dispatch(setCurrentTime(0));
    dispatch(setDuration(0));
    dispatch(setPlaybackError(null));
    audio.volume = volume;
    audio.src = track.track_file;
    audio.load();
    void startPlayback(audio);
  }, [currentTrack, dispatch, startPlayback, volume]);

  useEffect(() => {
    if (tracks.length === 0) return;

    const requestedId = new URLSearchParams(window.location.search).get('track');
    if (!requestedId || requestedTrackId.current === requestedId) return;

    const track = tracks.find((item) => item._id === Number(requestedId));
    if (!track) return;

    requestedTrackId.current = requestedId;
    selectTrack(track);
    window.history.replaceState(null, '', '/');
  }, [selectTrack, tracks]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.paused) {
      void startPlayback(audio);
    } else {
      audio.pause();
    }
  }, [currentTrack, startPlayback]);

  const playAdjacentTrack = useCallback((direction: -1 | 1) => {
    if (!currentTrack || currentPlaylist.length === 0) return;

    const currentIndex = currentPlaylist.findIndex(
      (track) => track._id === currentTrack._id,
    );

    if (currentIndex === -1) {
      selectTrack(
        direction === 1
          ? currentPlaylist[0]
          : currentPlaylist[currentPlaylist.length - 1],
      );
      return;
    }

    if (currentPlaylist.length === 1) return;

    if (isShuffle && direction === 1 && currentPlaylist.length > 1) {
      const candidates = currentPlaylist.filter(
        (track) => track._id !== currentTrack._id,
      );
      const nextTrack =
        candidates[Math.floor(Math.random() * candidates.length)];
      selectTrack(nextTrack);
      return;
    }

    const nextIndex =
      (currentIndex + direction + currentPlaylist.length) %
      currentPlaylist.length;
    selectTrack(currentPlaylist[nextIndex]);
  }, [currentPlaylist, currentTrack, isShuffle, selectTrack]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;

    audio.currentTime = time;
    dispatch(setCurrentTime(time));
  }, [dispatch]);

  const changeVolume = useCallback((nextVolume: number) => {
    const audio = audioRef.current;
    const clampedVolume = Math.max(0, Math.min(1, nextVolume));

    if (audio) audio.volume = clampedVolume;
    dispatch(setVolume(clampedVolume));
  }, [dispatch]);

  const toggleLoop = useCallback(() => {
    const nextLoop = !isLoop;
    if (audioRef.current) audioRef.current.loop = nextLoop;
    dispatch(setIsLoop(nextLoop));
  }, [dispatch, isLoop]);

  const updateCurrentPlaylist = useCallback((tracks: Track[]) => {
    dispatch(setCurrentPlaylist(tracks));
  }, [dispatch]);
  const toggleShuffle = useCallback(
    () => dispatch(setIsShuffle(!isShuffle)),
    [dispatch, isShuffle],
  );
  const playPreviousTrack = useCallback(
    () => playAdjacentTrack(-1),
    [playAdjacentTrack],
  );
  const playNextTrack = useCallback(() => playAdjacentTrack(1), [playAdjacentTrack]);
  const setCurrentTrackFavorite = useCallback(
    (shouldBeFavorite: boolean) => {
      if (currentTrack) {
        void changeFavorite(currentTrack, shouldBeFavorite);
      }
    },
    [changeFavorite, currentTrack],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Nav />
          <TrackList
            currentTrackId={currentTrack?._id ?? null}
            isPlaying={isPlaying}
            onSelectTrack={selectTrack}
            onPlaylistChange={updateCurrentPlaylist}
            favoriteTrackIds={favoriteTrackIds}
            favoriteLoadingIds={favoriteLoadingIds}
            onFavoriteChange={changeFavorite}
          />
          <Sidebar username={user?.username} />
        </main>
        <audio
          ref={audioRef}
          className={styles.audio}
          preload="metadata"
          loop={isLoop}
          onPlay={() => dispatch(setIsPlaying(true))}
          onPause={() => dispatch(setIsPlaying(false))}
          onTimeUpdate={(event) =>
            dispatch(setCurrentTime(event.currentTarget.currentTime))
          }
          onLoadedMetadata={(event) =>
            dispatch(setDuration(event.currentTarget.duration || 0))
          }
          onEnded={() => playAdjacentTrack(1)}
          onError={() => {
            dispatch(setIsPlaying(false));
            dispatch(setPlaybackError(
              'Не удалось загрузить аудиофайл. Проверьте подключение.',
            ));
          }}
        />
        <PlayerBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isLoop={isLoop}
          isShuffle={isShuffle}
          canNavigate={
            currentPlaylist.length > 1 ||
            (currentTrack !== null &&
              !currentPlaylist.some((track) => track._id === currentTrack._id))
          }
          volume={volume}
          currentTime={currentTime}
          duration={duration || currentTrack?.duration_in_seconds || 0}
          playbackError={playbackError}
          isFavorite={
            currentTrack !== null && favoriteTrackIds.includes(currentTrack._id)
          }
          favoriteCount={currentTrack?.staredUser?.length ?? 0}
          isFavoriteLoading={
            currentTrack !== null &&
            favoriteLoadingIds.includes(currentTrack._id)
          }
          favoritesError={favoritesError}
          onTogglePlayback={togglePlayback}
          onPreviousTrack={playPreviousTrack}
          onNextTrack={playNextTrack}
          onToggleLoop={toggleLoop}
          onToggleShuffle={toggleShuffle}
          onVolumeChange={changeVolume}
          onSeek={seek}
          onFavoriteChange={setCurrentTrackFavorite}
        />
      </div>
    </div>
  );
}
