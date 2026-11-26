'use client';

import { useEffect, useRef } from 'react';
import styles from './PlayerBar.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setCurrentTrack,
  setIsPlaying,
  setPlaybackError,
} from '@/store/playerSlice';

function Icon({ name, className }: { name: string; className: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/img/icon/sprite.svg#icon-${name}`} />
    </svg>
  );
}

export default function PlayerBar() {
  const dispatch = useAppDispatch();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrack, isPlaying, error } = useAppSelector(
    (state) => state.player,
  );
  const tracks = useAppSelector((state) => state.tracks.items);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      return;
    }

    audio.src = currentTrack.track_file;
    audio.load();
    if (isPlaying) {
      void audio.play().catch(() => {
        dispatch(setPlaybackError('Не удалось воспроизвести этот трек'));
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, dispatch, isPlaying]);

  const playAdjacentTrack = (direction: -1 | 1) => {
    if (!currentTrack || tracks.length < 2) return;
    const currentIndex = tracks.findIndex(
      (track) => track._id === currentTrack._id,
    );
    const nextIndex = (currentIndex + direction + tracks.length) % tracks.length;
    dispatch(setCurrentTrack(tracks[nextIndex]));
    dispatch(setIsPlaying(true));
  };

  return (
    <div className={styles.bar}>
      <div className={styles.progress} />
      <div className={styles.playerBlock}>
        <div className={styles.player}>
          <div className={styles.controls}>
            <button
              className={styles.controlButton}
              aria-label="Предыдущий трек"
              type="button"
              disabled={!currentTrack || tracks.length < 2}
              onClick={() => playAdjacentTrack(-1)}
            >
              <Icon name="prev" className={styles.prevSvg} />
            </button>
            <button
              className={styles.controlButton}
              aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
              type="button"
              disabled={!currentTrack}
              onClick={() => dispatch(setIsPlaying(!isPlaying))}
            >
              <Icon
                name={isPlaying ? 'pause' : 'play'}
                className={styles.playSvg}
              />
            </button>
            <button
              className={styles.controlButton}
              aria-label="Следующий трек"
              type="button"
              disabled={!currentTrack || tracks.length < 2}
              onClick={() => playAdjacentTrack(1)}
            >
              <Icon name="next" className={styles.nextSvg} />
            </button>
            <button
              className={styles.controlButton}
              aria-label="Повтор"
              type="button"
            >
              <Icon name="repeat" className={styles.repeatSvg} />
            </button>
            <button
              className={styles.controlButton}
              aria-label="Перемешать"
              type="button"
            >
              <Icon name="shuffle" className={styles.shuffleSvg} />
            </button>
          </div>
          <div className={styles.trackPlay}>
            <div className={styles.trackContain}>
              <div className={styles.trackImage}>
                <Icon name="note" className={styles.trackSvg} />
              </div>
              <div className={styles.trackAuthor}>
                {currentTrack?.name ?? 'Трек не выбран'}
              </div>
              <div className={styles.trackAlbum}>
                {currentTrack?.author ?? 'Выберите трек из списка'}
              </div>
            </div>
            {error && (
              <span className={styles.playerError} role="alert">
                {error}
              </span>
            )}
          </div>
        </div>
        <div className={styles.volumeBlock}>
          <div className={styles.volume}>
            <Icon name="volume" className={styles.volumeSvg} />
            <input
              className={styles.volumeRange}
              type="range"
              name="volume"
              aria-label="Громкость"
              min="0"
              max="1"
              step="0.01"
              defaultValue="0.5"
              onChange={(event) => {
                if (audioRef.current) {
                  audioRef.current.volume = Number(event.target.value);
                }
              }}
            />
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        hidden
        onEnded={() => dispatch(setIsPlaying(false))}
        onError={() =>
          dispatch(setPlaybackError('Не удалось загрузить аудиофайл'))
        }
      />
    </div>
  );
}
