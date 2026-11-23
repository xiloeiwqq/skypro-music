'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type Track, type User } from '@/data';
import {
  fetchFavoriteTracks,
  fetchTracks,
  setTrackFavorite,
} from '@/lib/api';
import { getSession, subscribeToSessionChange } from '@/lib/session';
import styles from './MainPage.module.css';
import Nav from './Nav';
import PlayerBar from './PlayerBar';
import Sidebar from './Sidebar';
import TrackList from './TrackList';

function updateTrackLikeState(
  track: Track,
  userId: number,
  shouldBeFavorite: boolean,
): Track {
  const likedUsers = track.staredUser ?? [];
  const alreadyLiked = likedUsers.includes(userId);
  if (alreadyLiked === shouldBeFavorite) return track;

  return {
    ...track,
    staredUser: shouldBeFavorite
      ? [...likedUsers, userId]
      : likedUsers.filter((likedUserId) => likedUserId !== userId),
  };
}

export default function MainPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestedTrackId = useRef<string | null>(null);
  const favoriteMutationVersion = useRef(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
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
    let active = true;
    fetchTracks()
      .then((result) => {
        if (!active) return;
        setTracks(result);
        setTracksError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setTracksError(
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить треки.',
        );
      })
      .finally(() => {
        if (active) setTracksLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateUser = () => {
      const nextUser = getSession()?.user ?? null;
      setUser((currentUser) =>
        currentUser?._id === nextUser?._id &&
        currentUser?.email === nextUser?.email
          ? currentUser
          : nextUser,
      );
    };

    updateUser();
    return subscribeToSessionChange(updateUser);
  }, []);

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
        setTracks((currentTracks) =>
          currentTracks.map((item) =>
            item._id === track._id
              ? updateTrackLikeState(item, user._id, shouldBeFavorite)
              : item,
          ),
        );
        setCurrentTrack((current) =>
          current?._id === track._id
            ? updateTrackLikeState(current, user._id, shouldBeFavorite)
            : current,
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
    [favoriteTrackIds, tracks, user],
  );

  const startPlayback = useCallback(async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      setPlaybackError(null);
    } catch {
      setIsPlaying(false);
      setPlaybackError(
        'Не удалось воспроизвести трек. Проверьте подключение и повторите попытку.',
      );
    }
  }, []);

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

    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackError(null);
    audio.volume = volume;
    audio.src = track.track_file;
    audio.load();
    void startPlayback(audio);
  }, [currentTrack, startPlayback, volume]);

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
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((nextVolume: number) => {
    const audio = audioRef.current;
    const clampedVolume = Math.max(0, Math.min(1, nextVolume));

    if (audio) audio.volume = clampedVolume;
    setVolume(clampedVolume);
  }, []);

  const toggleLoop = useCallback(() => {
    const nextLoop = !isLoop;
    if (audioRef.current) audioRef.current.loop = nextLoop;
    setIsLoop(nextLoop);
  }, [isLoop]);

  const updateCurrentPlaylist = useCallback((tracks: Track[]) => {
    setCurrentPlaylist(tracks);
  }, []);
  const toggleShuffle = useCallback(
    () => setIsShuffle((shuffle) => !shuffle),
    [],
  );
  const playPreviousTrack = useCallback(
    () => playAdjacentTrack(-1),
    [playAdjacentTrack],
  );
  const playNextTrack = useCallback(() => playAdjacentTrack(1), [playAdjacentTrack]);
  const retryTracks = useCallback(() => {
    setTracksLoading(true);
    setTracksError(null);
    fetchTracks()
      .then((result) => {
        setTracks(result);
        setTracksError(null);
      })
      .catch((error: unknown) => {
        setTracksError(
          error instanceof Error ? error.message : 'Не удалось загрузить треки.',
        );
      })
      .finally(() => setTracksLoading(false));
  }, []);
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
            tracks={tracks}
            isLoading={tracksLoading}
            error={tracksError}
            onRetry={retryTracks}
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
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(event) =>
            setCurrentTime(event.currentTarget.currentTime)
          }
          onLoadedMetadata={(event) =>
            setDuration(event.currentTarget.duration || 0)
          }
          onEnded={() => playAdjacentTrack(1)}
          onError={() => {
            setIsPlaying(false);
            setPlaybackError(
              'Не удалось загрузить аудиофайл. Проверьте подключение.',
            );
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
