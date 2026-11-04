'use client';

import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

type Props = {
  // Read on the server by the root layout: with an initial session, the
  // provider does not fetch /api/auth/session on mount.
  session: Session | null;
  children: React.ReactNode;
};

const RNBSessionProvider = ({ session, children }: Props) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default RNBSessionProvider;
