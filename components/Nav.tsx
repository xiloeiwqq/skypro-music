'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getSession, subscribeToSessionChange } from '@/lib/session';
import styles from './Nav.module.css';

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const updateUsername = () => {
      setUsername(getSession()?.user.username ?? null);
    };

    updateUsername();
    return subscribeToSessionChange(updateUsername);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.replace(pathname === '/favorites' ? '/' : '/signin');
  };

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
          <Link href="/favorites" className={styles.menuLink}>
            Мой плейлист
          </Link>
        </li>
        <li className={styles.menuItem}>
          <Link href="/collections" className={styles.menuLink}>
            Подборки
          </Link>
        </li>
        {username && (
          <li className={styles.menuItem}>
            <button
              className={styles.menuLink}
              type="button"
              onClick={handleLogout}
            >
              Выйти
            </button>
          </li>
        )}
        {!username && (
          <li className={styles.menuItem}>
            <Link href="/signin" className={styles.menuLink}>
              Войти
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
