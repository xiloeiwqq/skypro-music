'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSelections } from '@/store/collectionsSlice';
import styles from './Sidebar.module.css';

const playlistImages = ['playlist01.png', 'playlist02.png', 'playlist03.png'];

export default function Sidebar({ username }: { username?: string }) {
  const dispatch = useAppDispatch();
  const { items: selections, status, error } = useAppSelector(
    (state) => state.collections,
  );
  const isLoading = status === 'idle' || status === 'loading';

  useEffect(() => {
    if (status === 'idle') void dispatch(loadSelections());
  }, [dispatch, status]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.personal}>
        {username ? (
          <p className={styles.personalName}>{username}</p>
        ) : (
          <Link className={styles.personalName} href="/signin">
            Войти
          </Link>
        )}
        <div className={styles.icon} aria-hidden="true" />
      </div>
      <div className={styles.block}>
        <ul className={styles.list}>
          {selections.slice(0, 3).map((selection, index) => (
            <li className={styles.item} key={selection._id}>
              <Link
                className={styles.link}
                href={`/collections/${selection._id}`}
              >
                <Image
                  className={styles.image}
                  src={`/img/${playlistImages[index]}`}
                  alt={selection.name ?? 'Музыкальная подборка'}
                  width={250}
                  height={170}
                />
                <span className={styles.selectionName}>{selection.name}</span>
              </Link>
            </li>
          ))}
          {isLoading && <li className={styles.status}>Загружаем подборки…</li>}
          {error && (
            <li className={styles.status} role="alert">
              {error}
            </li>
          )}
          {!isLoading && !error && selections.length === 0 && (
            <li className={styles.status}>Подборок пока нет.</li>
          )}
        </ul>
      </div>
    </aside>
  );
}
