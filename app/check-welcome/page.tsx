'use client';

import styles from '@/styles/checkWelcome.module.scss';
import panelStyles from '@/styles/welcomePanel.module.scss';
import {
  HELP_VARIATIONS,
  HelpSourceModalBody,
} from '@/components/HelpSourcePanel';

const noop = () => {};

export default function CheckWelcomePage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>
        Modales d’accueil — {HELP_VARIATIONS.length} variations
      </h1>

      {HELP_VARIATIONS.map((variation) => (
        <section key={variation.from} className={styles.variation}>
          <h2 className={styles.variationTitle}>{variation.from}</h2>

          <dl className={styles.urls}>
            <dt>URL de la carte</dt>
            <dd>
              <a className={styles.mono} href={`/carte?from=${variation.from}`}>
                /carte?from={variation.from}
              </a>
            </dd>

            <dt>Provenance du visiteur</dt>
            <dd>
              <span className={styles.mono}>{variation.referrer}</span> — un
              referrer contenant ce domaine active « {variation.from} » sur
              /carte même sans paramètre{' '}
              <span className={styles.mono}>from</span>
            </dd>
          </dl>

          <div className={styles.triggerRow}>
            <button type="button" className={panelStyles.trigger}>
              {variation.triggerLabel}
            </button>
          </div>

          <div className={styles.slides}>
            {variation.slides.map((_, index) => (
              <div key={index} className={styles.slide}>
                <div className={styles.slideLabel}>Slide {index + 1}</div>
                {/* Same DOM as the real dialog; checkWelcome.module.scss
                    un-fixes .fr-modal so it renders inline. */}
                <div className="fr-modal">
                  <div className="fr-container fr-container--fluid fr-container-md">
                    <div className="fr-grid-row fr-grid-row--center">
                      <div className="fr-col-12">
                        <HelpSourceModalBody
                          slides={variation.slides}
                          currentPage={index}
                          onPrev={noop}
                          onNext={noop}
                          onClose={noop}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
