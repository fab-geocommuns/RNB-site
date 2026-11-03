import { Metadata } from 'next';

import { PageNotFound } from '@/components/ErrorPage';

export const metadata: Metadata = {
  title: 'Page non trouvée',
};

// Catches notFound() thrown by a page of this group (e.g. an unknown blog
// article); header and footer come from the group layout.
// Next sends such a 404 as an empty error shell that the browser renders. The
// root not-found would add its own stylesheet (header, footer) at that point,
// and React can then wait forever for it: the page stays blank. This boundary
// only needs the layout's stylesheets, already loaded.
export default function NotFound() {
  return <PageNotFound />;
}
