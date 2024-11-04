import { useSession } from 'next-auth/react';
import { PropsWithChildren } from 'react';

type ShouldBeConnectedProps = {} & PropsWithChildren;

export function ShouldBeConnected({ children }: ShouldBeConnectedProps) {
  const { status } = useSession();
  return status === 'authenticated' ? children : null;
}
