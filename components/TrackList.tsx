import Link from 'next/link';
import styles from './TrackList.module.css';

const tracks = [
  { title: 'Guilt', author: 'Nero', album: 'Welcome Reality', duration: '4:44' },
  {
    title: 'Elektro',
    author: 'Dynoro, Outwork, Mr. Gee',
    album: 'Elektro',
    duration: '2:22',
  },
  {
    title: 'I’m Fire',
    author: 'Ali Bakgor',
    album: 'I’m Fire',
    duration: '2:22',
  },
  {
    title: 'Non Stop',
    extra: '(Remix)',
    author: 'Стоункат, Psychopath',
    album: 'Non Stop',
    duration: '4:12',
  },
  {
    title: 'Run Run',
    extra: '(feat. AR/CO)',
    author: 'Jaded, Will Clarke, AR/CO',
    album: 'Run Run',
    duration: '2:54',
  },
];

function Icon({ name, className }: { name: string; className: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/img/icon/sprite.svg#icon-${name}`} />
    </svg>
  );
}

export default function TrackList() {
  return (
    <section className={styles.centerblock} aria-labelledby="tracks-heading">
      <div className={styles.search}>
        <Icon name="search" className={styles.searchSvg} />
        <input
          className={styles.searchText}
          type="search"
          placeholder="Поиск"
          name="search"
          aria-label="Поиск треков"
        />
      </div>
      <h1 className={styles.heading} id="tracks-heading">
        Треки
      </h1>
      <div className={styles.filter}>
        <span className={styles.filterTitle}>Искать по:</span>
        <button className={styles.filterButton} type="button">
          исполнителю
        </button>
        <button className={styles.filterButton} type="button">
          году выпуска
        </button>
        <button className={styles.filterButton} type="button">
          жанру
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.contentTitle}>
          <span className={`${styles.titleCol} ${styles.col01}`}>Трек</span>
          <span className={`${styles.titleCol} ${styles.col02}`}>
            Исполнитель
          </span>
          <span className={`${styles.titleCol} ${styles.col03}`}>Альбом</span>
          <span className={`${styles.titleCol} ${styles.col04}`}>
            <Icon name="watch" className={styles.titleSvg} />
          </span>
        </div>
        <div className={styles.playlist}>
          {tracks.map((track) => (
            <div className={styles.playlistItem} key={track.title}>
              <div className={styles.playlistTrack}>
                <div className={styles.trackTitle}>
                  <div className={styles.trackTitleImage}>
                    <Icon name="note" className={styles.trackTitleSvg} />
                  </div>
                  <div>
                    <Link href="#" className={styles.trackTitleLink}>
                      {track.title}{' '}
                      {track.extra && (
                        <span className={styles.trackTitleExtra}>
                          {track.extra}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
                <div className={styles.trackAuthor}>
                  <Link href="#" className={styles.trackAuthorLink}>
                    {track.author}
                  </Link>
                </div>
                <div className={styles.trackAlbum}>
                  <Link href="#" className={styles.trackAlbumLink}>
                    {track.album}
                  </Link>
                </div>
                <div className={styles.trackTime}>
                  <Icon name="like" className={styles.trackTimeSvg} />
                  <span className={styles.trackTimeText}>{track.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
