import { Suspense } from 'react';
import CollectionDetails from '@/components/CollectionDetails';

export default function CollectionRoute() {
  return (
    <Suspense fallback={<p>Загружаем подборку…</p>}>
      <CollectionDetails />
    </Suspense>
  );
}
