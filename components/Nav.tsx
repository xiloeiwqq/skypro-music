'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Nav.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/authSlice';

export default function Nav() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

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
      <div className={styles.burger} aria-hidden="true">
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
      </div>
      <ul className={styles.menuList}>
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
          {user ? (
            <button
              className={`${styles.menuLink} ${styles.menuButton}`}
              type="button"
              onClick={() => dispatch(logout())}
            >
              Выйти
            </button>
          ) : (
            <Link href="/signin" className={styles.menuLink}>
              Войти
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
