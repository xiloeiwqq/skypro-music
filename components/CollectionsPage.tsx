'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Selection } from '@/data';
import { fetchSelections } from '@/lib/api';
import shellStyles from './MainPage.module.css';
import Nav from './Nav';
import styles from './CatalogPage.module.css';

const collectionImages = [
  '/img/playlist01.png',
  '/img/playlist02.png',
  '/img/playlist03.png',
];

export default function CollectionsPage() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;
    fetchSelections()
      .then((result) => {
        if (active) {
          setSelections(
            result.filter(
              (selection) => selection.name && selection.items.length,
            ),
          );
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Не удалось загрузить подборки.',
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadCount]);

  return (
    <div className={shellStyles.wrapper}>
      <div className={shellStyles.container}>
        <main className={shellStyles.main}>
          <Nav />
          <section className={styles.pageContent}>
            <h1 className={styles.pageHeading}>Подборки</h1>
            {isLoading && <p className={styles.status}>Загружаем подборки…</p>}
            {error && (
              <div className={styles.error} role="alert">
                {error}
                <button
                  className={styles.retryButton}
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setError(null);
                    setReloadCount((count) => count + 1);
                  }}
                >
                  Повторить запрос
                </button>
              </div>
            )}
            {!isLoading && !error && selections.length === 0 && (
              <p className={styles.status}>Подборок пока нет.</p>
            )}
            {!isLoading && !error && selections.length > 0 && (
              <div className={styles.collectionGrid}>
                {selections.map((selection, index) => (
                  <Link
                    className={styles.collectionCard}
                    href={`/collections/${selection._id}`}
                    key={selection._id}
                  >
                    <span className={styles.collectionImage}>
                      <Image
                        src={collectionImages[index % collectionImages.length]}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 100vw, 250px"
                      />
                    </span>
                    <span className={styles.collectionTitle}>
                      {selection.name}
                    </span>
                    <span className={styles.collectionCount}>
                      {selection.items.length} треков
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
