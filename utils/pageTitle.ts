import { Metadata } from 'next';

export default function pageTitle(
  title: string,
  otherMetadata?: Omit<Metadata, 'title'>,
): Metadata {
  return {
    title: `${title} | Référentiel National des Bâtiments`,
    ...(otherMetadata || {}),
  };
}
