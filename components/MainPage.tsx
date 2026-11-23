import styles from './MainPage.module.css';
import Nav from './Nav';
import PlayerBar from './PlayerBar';
import Sidebar from './Sidebar';
import TrackList from './TrackList';

export default function MainPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Nav />
          <TrackList />
          <Sidebar />
        </main>
        <PlayerBar />
      </div>
    </div>
  );
}
