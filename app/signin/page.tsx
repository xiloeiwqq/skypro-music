import { Suspense, use } from 'react';
import Signin from '@/auth/signin';

type SigninPageProps = {
  searchParams: Promise<{ registered?: string }>;
};

function SigninWithStatus({ searchParams }: SigninPageProps) {
  const { registered } = use(searchParams);
  return <Signin isRegistered={registered === '1'} />;
}

export default function SigninPage({ searchParams }: SigninPageProps) {
  return (
    <Suspense fallback={<p>Загружаем форму входа…</p>}>
      <SigninWithStatus searchParams={searchParams} />
    </Suspense>
  );
}
