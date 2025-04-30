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
  id: number;
};

type UseRNBAuthentication = {
  status: RNBAuthenticationStatus;
  user: AuthenticatedUser | null;

  is: (group: RNBGroup) => boolean;
};

export const useRNBAuthentication = (options?: {
  require: boolean;
}): UseRNBAuthentication => {
  const { status, data } = useSession();
  const router = useRouter();
  const sessionData = data as any;
  const groups = sessionData?.groups ? (sessionData.groups as RNBGroup[]) : [];
  let user = null;

  useEffect(() => {
    if (
      options?.require &&
      status !== 'loading' &&
      status !== 'authenticated'
    ) {
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.href = `/login?redirect=${encodeURIComponent(currentLocation)}`;
    }
  }, [status, options?.require]);

  if (status === 'authenticated') {
    user = {
      id: sessionData.id,
      username: sessionData.username,
      groups,
    };
  }

  return {
    status:
      status === 'authenticated'
        ? RNBAuthenticationStatus.AUTHENTICATED
        : RNBAuthenticationStatus.DISCONNECTED,
    user,
    is: (group: RNBGroup) =>
      status === 'authenticated' && groups.includes(group),
  };
};
