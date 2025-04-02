import { PropsWithChildren } from 'react';
import {
  RNBAuthenticationStatus,
  RNBGroup,
  useRNBAuthentication,
} from '@/utils/use-rnb-authentication';
import assert from 'assert';
type ShouldBeConnectedProps = {
  withGroup?: RNBGroup;
  withGroups?: RNBGroup[];
} & PropsWithChildren;

export function ShouldBeConnected({
  withGroups,
  withGroup,
  children,
}: ShouldBeConnectedProps) {
  const { status, user } = useRNBAuthentication();
  if (status !== RNBAuthenticationStatus.AUTHENTICATED) return null;

  assert(user, '`user` should be defined');
  const groups = user.groups;

  if (withGroups && withGroups.every((group) => groups.includes(group))) {
    return null;
  }

  if (withGroup && !groups.includes(withGroup)) {
    return null;
  }

  return children;
}
