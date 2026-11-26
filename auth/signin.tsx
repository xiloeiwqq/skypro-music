'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import styles from './signin.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, logIn } from '@/store/authSlice';

export default function Signin({ isRegistered }: { isRegistered: boolean }) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { loginStatus, error } = useAppSelector((state) => state.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const isLoading = loginStatus === 'loading';
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        dispatch(logIn({ email: email.trim(), password })).then((result) => {
            if (logIn.fulfilled.match(result)) {
                router.replace('/');
                router.refresh();
            }
        });
    };

    return (
        <>
            <div className={styles.wrapper}>
                <div className={styles.containerEnter}>
                    <div className={styles.modal__block}>
                        <form
                            className={styles.modal__form}
                            onSubmit={handleSubmit}
                            aria-busy={isLoading}
                        >
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
                                autoComplete="email"
                                required
                                placeholder="Почта"
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
                                autoComplete="current-password"
                                required
                                placeholder="Пароль"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    dispatch(clearAuthError());
                                }}
                            />
                            {isRegistered && (
                                <p className={styles.successMessage} role="status">
                                    Аккаунт создан. Теперь войдите в систему.
                                </p>
                            )}
                            <div className={styles.errorContainer} role="alert">
                                {error}
                            </div>
                            <button
                                className={styles.modal__btnEnter}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Входим…' : 'Войти'}
                            </button>
                            <Link href="/signup" className={styles.modal__btnSignup}>
                                Зарегистрироваться
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
