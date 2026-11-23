'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import styles from './signin.module.css';
import { loginUser } from '@/lib/api';

export default function Signin({ isRegistered }: { isRegistered: boolean }) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await loginUser(email.trim(), password);
            router.replace('/');
            router.refresh();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Не удалось войти. Попробуйте ещё раз.',
            );
        } finally {
            setIsLoading(false);
        }
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
                                onChange={(event) => setEmail(event.target.value)}
                            />
                            <input
                                className={styles.modal__input}
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                required
                                placeholder="Пароль"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
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
