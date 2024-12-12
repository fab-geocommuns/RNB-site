import { PropsWithChildren } from 'react';
import {
  RNBAuthenticationStatus,
  RNBGroup,
  useRNBAuthentication,
} from '@/utils/use-rnb-authentication';

type ShouldBeConnectedProps = {
  withGroup?: RNBGroup;
  withGroups?: RNBGroup[];
} & PropsWithChildren;

export function ShouldBeConnected({
  withGroups,
  withGroup,
  children,
}: ShouldBeConnectedProps) {
  const {
    status,
    user: { groups },
  } = useRNBAuthentication();
  if (status !== RNBAuthenticationStatus.AUTHENTICATED) return null;

  if (withGroups && withGroups.every((group) => groups.includes(group))) {
    return null;
  }

  if (withGroup && !groups.includes(withGroup)) {
    return null;
  }

  return children;
}
