'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, register } from '@/store/authSlice';
import styles from './signup.module.css';

export default function SignUp() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { registrationStatus, error } = useAppSelector((state) => state.auth);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const isLoading = registrationStatus === 'loading';

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== repeatPassword) {
            setFormError('Пароли не совпадают.');
            return;
        }

        setFormError(null);
        dispatch(clearAuthError());
        const normalizedUsername = username.trim();
        dispatch(
            register({
                username: normalizedUsername,
                email: email.trim(),
                password,
            }),
        ).then((result) => {
            if (register.fulfilled.match(result)) {
                router.replace('/signin?registered=1');
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
                                className={styles.modal__input}
                                type="text"
                                name="username"
                                autoComplete="username"
                                required
                                placeholder="Имя пользователя"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                            />
                            <input
                                className={`${styles.modal__input} ${styles.login}`}
                                type="email"
                                name="email"
                                autoComplete="email"
                                required
                                placeholder="Почта"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                            <input
                                className={styles.modal__input}
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                required
                                placeholder="Пароль"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                            <input
                                className={styles.modal__input}
                                type="password"
                                name="repeatPassword"
                                autoComplete="new-password"
                                required
                                placeholder="Повторите пароль"
                                value={repeatPassword}
                                onChange={(event) => setRepeatPassword(event.target.value)}
                            />
                            <div className={styles.errorContainer} role="alert">
                                {formError ?? error}
                            </div>
                            <button
                                className={styles.modal__btnSignupEnt}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Регистрируем…' : 'Зарегистрироваться'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
