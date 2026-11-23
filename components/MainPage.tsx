'use client';

import { useCallback, useRef, useState } from 'react';
import { data, type Track } from '@/data';
import styles from './MainPage.module.css';
import Nav from './Nav';
import PlayerBar from './PlayerBar';
import Sidebar from './Sidebar';
import TrackList from './TrackList';

export default function MainPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>(data);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const startPlayback = async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      setPlaybackError(null);
    } catch {
      setIsPlaying(false);
      setPlaybackError(
        'Не удалось воспроизвести трек. Проверьте подключение и повторите попытку.',
      );
    }
  };

  const selectTrack = (track: Track) => {
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
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.paused) {
      void startPlayback(audio);
    } else {
      audio.pause();
    }
  };

  const playAdjacentTrack = (direction: -1 | 1) => {
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
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;

    audio.currentTime = time;
    setCurrentTime(time);
  };

  const changeVolume = (nextVolume: number) => {
    const audio = audioRef.current;
    const clampedVolume = Math.max(0, Math.min(1, nextVolume));

    if (audio) audio.volume = clampedVolume;
    setVolume(clampedVolume);
  };

  const toggleLoop = () => {
    const nextLoop = !isLoop;
    if (audioRef.current) audioRef.current.loop = nextLoop;
    setIsLoop(nextLoop);
  };

  const updateCurrentPlaylist = useCallback((tracks: Track[]) => {
    setCurrentPlaylist(tracks);
  }, []);

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
          />
          <Sidebar />
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
          onTogglePlayback={togglePlayback}
          onPreviousTrack={() => playAdjacentTrack(-1)}
          onNextTrack={() => playAdjacentTrack(1)}
          onToggleLoop={toggleLoop}
          onToggleShuffle={() => setIsShuffle((shuffle) => !shuffle)}
          onVolumeChange={changeVolume}
          onSeek={seek}
        />
      </div>
    </div>
  );
}
