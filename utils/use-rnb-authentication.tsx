import { useSession } from 'next-auth/react';

export enum RNBGroup {
  CONTRIBUTORS = 'Contributors',
}

export enum RNBAuthenticationStatus {
  DISCONNECTED = 'DISCONNECTED',
  AUTHENTICATED = 'AUTHENTICATED',
}

type UseRNBAuthentication = {
  status: RNBAuthenticationStatus;
  user: {
    username: string;
    groups: RNBGroup[];
  };

  is: (group: RNBGroup) => boolean;
};

export const useRNBAuthentication = (): UseRNBAuthentication => {
  const { status, data } = useSession();
  const groups =
    data && (data as any).groups ? ((data as any).groups as RNBGroup[]) : [];

  return {
    status:
      status === 'authenticated'
        ? RNBAuthenticationStatus.AUTHENTICATED
        : RNBAuthenticationStatus.DISCONNECTED,
    user: {
      username: (data as any)?.username,
      groups,
    },
    is: (group: RNBGroup) =>
      status === 'authenticated' && groups.includes(group),
  };
};
