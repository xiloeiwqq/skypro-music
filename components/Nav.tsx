'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Nav.module.css';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <nav className={styles.nav} aria-label="Основная навигация">
      <Link href="/" className={styles.logo}>
        <Image
          className={styles.logoImage}
          src="/img/logo.png"
          alt="Музыка"
          width={114}
          height={17}
          priority
        />
      </Link>
      <button
        className={styles.burger}
        type="button"
        aria-label={isMenuOpen ? 'Свернуть меню' : 'Открыть меню'}
        aria-expanded={isMenuOpen}
        aria-controls="main-menu"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
      </button>
      <ul
        className={`${styles.menuList} ${isMenuOpen ? '' : styles.menuListClosed}`}
        id="main-menu"
      >
        <li className={styles.menuItem}>
          <Link href="/" className={styles.menuLink}>
            Главное
          </Link>
        </li>
        <li className={styles.menuItem}>
          <Link href="#" className={styles.menuLink}>
            Мой плейлист
          </Link>
        </li>
        <li className={styles.menuItem}>
          <Link href="/signin" className={styles.menuLink}>
            Войти
          </Link>
        </li>
      </ul>
    </nav>
  );
}
