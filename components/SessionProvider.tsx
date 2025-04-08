'use client';

import { SessionProvider } from 'next-auth/react';

// @ts-ignore
const RNBSessionProvider = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default RNBSessionProvider;
