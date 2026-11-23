'use client';

import type { Track } from '@/data';
import styles from './PlayerBar.module.css';

type PlayerBarProps = {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoop: boolean;
  isShuffle: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  canNavigate: boolean;
  playbackError: string | null;
  onTogglePlayback: () => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
};

function Icon({ name, className }: { name: string; className: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/img/icon/sprite.svg#icon-${name}`} />
    </svg>
  );
}

function formatTime(time: number) {
  if (!Number.isFinite(time)) return '0:00';

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function PlayerBar({
  currentTrack,
  isPlaying,
  isLoop,
  isShuffle,
  volume,
  currentTime,
  duration,
  canNavigate,
  playbackError,
  onTogglePlayback,
  onPreviousTrack,
  onNextTrack,
  onToggleLoop,
  onToggleShuffle,
  onVolumeChange,
  onSeek,
}: PlayerBarProps) {
  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <div className={styles.bar}>
      <div className={styles.progressRow}>
        <span className={styles.progressTime}>{formatTime(currentTime)}</span>
        <div className={styles.progress}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
          <input
            className={styles.progressInput}
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            step={0.1}
            value={Math.min(currentTime, duration)}
            aria-label="Позиция воспроизведения"
            aria-valuetext={`${formatTime(currentTime)} из ${formatTime(duration)}`}
            disabled={!currentTrack}
            onChange={(event) => onSeek(event.currentTarget.valueAsNumber)}
          />
        </div>
        <span className={styles.progressTime}>{formatTime(duration)}</span>
      </div>
      <div className={styles.playerBlock}>
        <div className={styles.player}>
          <div className={styles.controls}>
            <button
              className={styles.controlButton}
              type="button"
              aria-label="Предыдущий трек"
              disabled={!currentTrack || !canNavigate}
              onClick={onPreviousTrack}
            >
              <Icon name="prev" className={styles.prevSvg} />
            </button>
            <button
              className={styles.controlButton}
              type="button"
              aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
              disabled={!currentTrack}
              onClick={onTogglePlayback}
            >
              <Icon
                name={isPlaying ? 'pause' : 'play'}
                className={styles.playSvg}
              />
            </button>
            <button
              className={styles.controlButton}
              type="button"
              aria-label="Следующий трек"
              disabled={!currentTrack || !canNavigate}
              onClick={onNextTrack}
            >
              <Icon name="next" className={styles.nextSvg} />
            </button>
            <button
              className={`${styles.controlButton} ${
                isLoop ? styles.activeControl : ''
              }`}
              type="button"
              aria-label={isLoop ? 'Выключить повтор' : 'Повторять трек'}
              aria-pressed={isLoop}
              onClick={onToggleLoop}
            >
              <Icon name="repeat" className={styles.repeatSvg} />
            </button>
            <button
              className={`${styles.controlButton} ${
                isShuffle ? styles.activeControl : ''
              }`}
              type="button"
              aria-label={isShuffle ? 'Выключить перемешивание' : 'Перемешать'}
              aria-pressed={isShuffle}
              onClick={onToggleShuffle}
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
                <span className={styles.trackAuthorLink}>
                  {currentTrack?.name ?? 'Выберите трек'}
                </span>
              </div>
              <div className={styles.trackAlbum}>
                <span className={styles.trackAlbumLink}>
                  {currentTrack?.author ?? ''}
                </span>
              </div>
            </div>
            <div className={styles.trackActions}>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="Нравится"
                disabled={!currentTrack}
              >
                <Icon name="like" className={styles.actionSvg} />
              </button>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="Не нравится"
                disabled={!currentTrack}
              >
                <Icon name="dislike" className={styles.actionSvg} />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.volumeBlock}>
          <div className={styles.volume}>
            <Icon name="volume" className={styles.volumeSvg} />
            <input
              className={styles.volumeRange}
              type="range"
              name="volume"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              aria-label="Громкость"
              onChange={(event) =>
                onVolumeChange(event.currentTarget.valueAsNumber)
              }
            />
          </div>
        </div>
      </div>
      {playbackError && (
        <p className={styles.playbackError} role="alert">
          {playbackError}
        </p>
      )}
    </div>
  );
}
