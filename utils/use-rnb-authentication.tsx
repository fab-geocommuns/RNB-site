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
  status: RNBAuthenticationStatus;
  user: AuthenticatedUser | null;

  is: (group: RNBGroup) => boolean;
};

export const useRNBAuthentication = (options?: {
  require: boolean;
}): UseRNBAuthentication => {
  const { status, data } = useSession();
  console.log(data);
  console.log(status);
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
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.href = `/login?redirect=${encodeURIComponent(currentLocation)}`;
    }
  }, [status, options?.require]);

  if (status === 'authenticated') {
    user = {
      username,
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
