'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import styles from './signup.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, signUp } from '@/store/authSlice';

export default function SignUp() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const isLoading = status === 'loading';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== repeatedPassword) {
      setFormError('Пароли не совпадают');
      return;
    }

    setFormError(null);
    dispatch(signUp({ email, password })).then((result) => {
      if (signUp.fulfilled.match(result)) {
        router.push('/signin');
      }
    });
  };

  const clearErrors = () => {
    setFormError(null);
    dispatch(clearAuthError());
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
                clearErrors();
              }}
            />
            <input
              className={styles.modal__input}
              type="password"
              name="password"
              placeholder="Пароль"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearErrors();
              }}
            />
            <input
              className={styles.modal__input}
              type="password"
              name="repeat-password"
              placeholder="Повторите пароль"
              autoComplete="new-password"
              required
              value={repeatedPassword}
              onChange={(event) => {
                setRepeatedPassword(event.target.value);
                clearErrors();
              }}
            />
            <div className={styles.errorContainer} role="alert">
              {formError ?? error}
            </div>
            <button
              className={styles.modal__btnSignupEnt}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
