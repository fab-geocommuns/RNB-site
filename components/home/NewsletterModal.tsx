import { createModal } from '@codegouvfr/react-dsfr/Modal';
import NewsletterForm from '../NewsletterForm';
import Link from 'next/link';

const newsletterModal = createModal({
  id: 'newsletter-modal',
  isOpenedByDefault: false,
});

export { newsletterModal };

export default function NewsletterModal() {
  return (
    <newsletterModal.Component title="Les actualités du RNB">
      <p>
        Restez informé des <Link href="/blog">actualités</Link> du RNB en vous
        inscrivant à l&apos;infolettre ou en nous suivant sur{' '}
        <Link href="https://www.linkedin.com/company/r-f-rentiel-national-des-b-timents/">
          LinkedIn
        </Link>
        .
      </p>
      <NewsletterForm formId="newsletter-form-modal" />
    </newsletterModal.Component>
  );
}
