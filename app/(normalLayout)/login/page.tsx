'use client';

import LoginForm from '@/components/LoginForm';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const params = useSearchParams();
  const redirectUrl = params.has('redirect')
    ? params.get('redirect')!
    : '/carte';

  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-col-md-4 fr-py-12v">
            <LoginForm redirectUrl={redirectUrl} />
          </div>
        </div>
      </div>
    </>
  );
}
