'use client';

import { SessionProvider } from 'next-auth/react';

const RNBSessionProvider = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default RNBSessionProvider;
