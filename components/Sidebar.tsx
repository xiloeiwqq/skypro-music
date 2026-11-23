import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Selection } from '@/data';
import { fetchSelections } from '@/lib/api';
import styles from './Sidebar.module.css';

const playlistImages = ['playlist01.png', 'playlist02.png', 'playlist03.png'];

export default function Sidebar({ username }: { username?: string }) {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchSelections()
      .then((items) => {
        if (isMounted) {
          setSelections(
            items.filter((selection) => selection.name && selection.items.length),
          );
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Не удалось загрузить подборки.',
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
