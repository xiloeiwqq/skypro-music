'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import styles from './signin.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, signIn } from '@/store/authSlice';

export default function Signin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isLoading = status === 'loading';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(signIn({ email, password })).then((result) => {
      if (signIn.fulfilled.match(result)) {
        router.push('/');
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.containerEnter}>
        <div className={styles.modal__block}>
          <form className={styles.modal__form} onSubmit={handleSubmit}>
            <Link href="/">
              <div className={styles.modal__logo}>
                <Image
                  src="/img/logo_modal.png"
                  alt="Музыка"
                  width={140}
                  height={21}
                />
              </div>
            </Link>
            <input
              className={`${styles.modal__input} ${styles.login}`}
              type="email"
              name="email"
              placeholder="Почта"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                dispatch(clearAuthError());
              }}
            />
            <input
              className={styles.modal__input}
              type="password"
              name="password"
              placeholder="Пароль"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                dispatch(clearAuthError());
              }}
            />
            <div className={styles.errorContainer} role="alert">
              {error}
            </div>
            <button
              className={styles.modal__btnEnter}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Входим...' : 'Войти'}
            </button>
            <Link href="/signup" className={styles.modal__btnSignup}>
              Зарегистрироваться
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
