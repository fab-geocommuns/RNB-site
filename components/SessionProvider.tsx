'use client';

import type { Session } from 'next-auth';
import { SessionProvider, getSession } from 'next-auth/react';
import { useEffect } from 'react';

type Props = {
  // Read on the server by the root layout: with an initial session, the
  // provider does not fetch /api/auth/session on mount.
  session: Session | null;
  children: React.ReactNode;
};

// The session cookie expires 30 days after it was last issued, and only
// /api/auth/session issues it again: the server read of the root layout cannot
// set cookies. Call it once per page load, after rendering, so that an active
// user stays signed in.
function ExtendSessionCookie({ signedIn }: { signedIn: boolean }) {
  useEffect(() => {
    if (signedIn) {
      // No broadcast: other tabs do not need to refetch their session
      getSession({ broadcast: false });
    }
  }, [signedIn]);
  return null;
}

const RNBSessionProvider = ({ session, children }: Props) => {
  return (
    <SessionProvider session={session}>
      <ExtendSessionCookie signedIn={session !== null} />
      {children}
    </SessionProvider>
  );
};

export default RNBSessionProvider;
