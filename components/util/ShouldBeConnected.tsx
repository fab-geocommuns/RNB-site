import { useSession } from 'next-auth/react';
import { PropsWithChildren } from 'react';

type ShouldBeConnectedProps = {
  withGroup?: Group;
  withGroups?: Group[];
} & PropsWithChildren;

export enum Group {
  CONTRIBUTORS = 'Contributors',
}

export function ShouldBeConnected({
  withGroups,
  withGroup,
  children,
}: ShouldBeConnectedProps) {
  const { status, data } = useSession();
  if (status !== 'authenticated') return null;

  const userGroups = (data as any).groups as Group[] | undefined;
  if (
    withGroups &&
    (!userGroups || !withGroups.every((group) => userGroups.includes(group)))
  ) {
    return null;
  }

  if (withGroup && (!userGroups || !userGroups.includes(withGroup))) {
    return null;
  }

  return children;
}
