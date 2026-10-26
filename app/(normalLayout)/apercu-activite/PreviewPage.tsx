import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import {
  ButtonsGroup,
  ButtonsGroupProps,
} from '@codegouvfr/react-dsfr/ButtonsGroup';

import ContributionSummary from '@/components/home/ContributionSummary';
import {
  loadContributionSummaries,
  SummaryVariant,
} from '@/utils/contributionSummary';

// The layouts compared before choosing the one of the home page
const VARIANTS: { variant: SummaryVariant; label: string; href: string }[] = [
  { variant: 'simple', label: 'Simple', href: '/apercu-activite' },
  { variant: 'complet', label: 'Complet', href: '/apercu-activite/complet' },
  { variant: 'recit', label: 'Récit', href: '/apercu-activite/recit' },
];

// Preview of the « Participer au RNB » section of the home page, to try it with
// production data before showing it on the home page. Linked from nowhere and
// not indexed.
export default async function PreviewPage({
  variant,
}: {
  variant: SummaryVariant;
}) {
  const summaries = await loadContributionSummaries();

  return (
    <div className="fr-container">
      <nav aria-label="Variantes de la section" className={fr.cx('fr-mt-4w')}>
        <ButtonsGroup
          inlineLayoutWhen="always"
          buttonsSize="small"
          buttons={
            VARIANTS.map((v) => ({
              children: v.label,
              priority: v.variant === variant ? 'primary' : 'tertiary',
              linkProps: {
                href: v.href,
                'aria-current': v.variant === variant ? 'page' : undefined,
              },
            })) as ButtonsGroupProps['buttons']
          }
        />
      </nav>
      {/* the home page hides the section silently; the preview says why */}
      {!summaries && (
        <Alert
          className="fr-mt-6w"
          severity="warning"
          title="Synthèse indisponible"
          description="L’API n’a pas répondu. La section serait masquée sur la page d’accueil."
        />
      )}
      <ContributionSummary summaries={summaries} variant={variant} />
    </div>
  );
}
