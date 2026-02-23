import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export enum RNBGroup {
  CONTRIBUTORS = 'Contributors',
}

export enum RNBAuthenticationStatus {
  DISCONNECTED = 'DISCONNECTED',
  AUTHENTICATED = 'AUTHENTICATED',
}

type AuthenticatedUser = {
  username: string;
  groups: RNBGroup[];
};

type UseRNBAuthentication = {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  is: (group: RNBGroup) => boolean;
};

export function loginUrl(redirect?: string) {
  const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const redirectUrl = redirect || currentLocation;
  return `/login?redirect=${encodeURIComponent(redirectUrl)}`;
}

export const useRNBAuthentication = (options?: {
  require: boolean;
}): UseRNBAuthentication => {
  const { status, data } = useSession();
  const router = useRouter();
  const groups =
    data && (data as any).groups ? ((data as any).groups as RNBGroup[]) : [];
  const username = (data as any)?.username;
  let user = null;

  useEffect(() => {
    if (
      options?.require &&
      status !== 'loading' &&
      status !== 'authenticated'
    ) {
      window.location.href = loginUrl();
    }
  }, [status, options?.require]);

  if (status === 'authenticated') {
    user = {
      username,
      groups,
    };
  }

  return {
    isAuthenticated: status === 'authenticated',
    user,
    is: (group: RNBGroup) =>
      status === 'authenticated' && groups.includes(group),
  };
};
