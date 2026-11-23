import Link from 'next/link';
import styles from './PlayerBar.module.css';

function Icon({ name, className }: { name: string; className: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/img/icon/sprite.svg#icon-${name}`} />
    </svg>
  );
}

export default function PlayerBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.progress} />
      <div className={styles.playerBlock}>
        <div className={styles.player}>
          <div className={styles.controls}>
            <button className={styles.controlButton} aria-label="Предыдущий трек">
              <Icon name="prev" className={styles.prevSvg} />
            </button>
            <button className={styles.controlButton} aria-label="Воспроизвести">
              <Icon name="play" className={styles.playSvg} />
            </button>
            <button className={styles.controlButton} aria-label="Следующий трек">
              <Icon name="next" className={styles.nextSvg} />
            </button>
            <button className={styles.controlButton} aria-label="Повтор">
              <Icon name="repeat" className={styles.repeatSvg} />
            </button>
            <button className={styles.controlButton} aria-label="Перемешать">
              <Icon name="shuffle" className={styles.shuffleSvg} />
            </button>
          </div>
          <div className={styles.trackPlay}>
            <div className={styles.trackContain}>
              <div className={styles.trackImage}>
                <Icon name="note" className={styles.trackSvg} />
              </div>
              <div className={styles.trackAuthor}>
                <Link className={styles.trackAuthorLink} href="#">
                  Ты та...
                </Link>
              </div>
              <div className={styles.trackAlbum}>
                <Link className={styles.trackAlbumLink} href="#">
                  Баста
                </Link>
              </div>
            </div>
            <div className={styles.trackActions}>
              <button className={styles.iconButton} aria-label="Нравится">
                <Icon name="like" className={styles.actionSvg} />
              </button>
              <button className={styles.iconButton} aria-label="Не нравится">
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
              aria-label="Громкость"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
