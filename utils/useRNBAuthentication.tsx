import { useSession } from 'next-auth/react';

export enum RNBGroup {
  CONTRIBUTORS = 'Contributors',
  REVIEWERS = 'Reviewers',
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
  return `/connexion?redirect=${encodeURIComponent(redirectUrl)}`;
}

export const useRNBAuthentication = (): UseRNBAuthentication => {
  const { status, data } = useSession();
  const groups =
    data && (data as any).groups ? ((data as any).groups as RNBGroup[]) : [];
  const username = (data as any)?.username;
  let user = null;

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
