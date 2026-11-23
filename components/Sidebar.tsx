import Image from 'next/image';
import Link from 'next/link';
import styles from './Sidebar.module.css';

const playlists = [
  { image: 'playlist01.png', name: 'Плейлист дня' },
  { image: 'playlist02.png', name: '100 танцевальных хитов' },
  { image: 'playlist03.png', name: 'Инди-заряд' },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.personal}>
        <p className={styles.personalName}>Sergey.Ivanov</p>
        <div className={styles.icon} aria-hidden="true" />
      </div>
      <div className={styles.block}>
        <ul className={styles.list}>
          {playlists.map((playlist) => (
            <li className={styles.item} key={playlist.image}>
              <Link className={styles.link} href="#">
                <Image
                  className={styles.image}
                  src={`/img/${playlist.image}`}
                  alt={playlist.name}
                  width={250}
                  height={170}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
