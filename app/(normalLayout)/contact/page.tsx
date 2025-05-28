'use client';

// Hooks
import React, { useState } from 'react';

// Settings
import settings from '@/logic/settings';
import styles from '@/styles/contact.module.scss';

// Comps
import { Tile } from '@codegouvfr/react-dsfr/Tile';
import CopyToClipboard from '@/components/util/CopyToClipboard';

// Logos
import faqIllu from '@/public/images/faq-illu.svg';
import mailIllu from '@/public/images/mail-illu.svg';
import coopIllu from '@/public/images/coop-illu.svg';
import appIllu from '@/public/images/app-illu.svg';
import internetIllu from '@/public/images/internet-illu.svg';

// Styles
import { fr } from '@codegouvfr/react-dsfr';

export default function Contact() {
  const contactEmail = settings.contactEmail;

  const [emailCopied, setEmailCopied] = useState(false);

  // @ts-ignore
  const handleCopy = (e) => {
    setEmailCopied(true);
    setTimeout(() => {
      setEmailCopied(false);
    }, 2000);
  };

  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-col-md-12 fr-py-12v">
            <h1>Contact</h1>

            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-6">
                <Tile
                  imageUrl={faqIllu.src}
                  title="Foire aux questions"
                  imageSvg={false}
                  orientation="horizontal"
                  desc="Votre demande est peut être déjà dans notre foire aux questions."
                  linkProps={{
                    href: '/faq',
                  }}
                />
              </div>

              <div className="fr-col-12 fr-col-md-6">
                <Tile
                  imageUrl={coopIllu.src}
                  title="Une erreur ?!"
                  imageSvg={false}
                  orientation="horizontal"
                  desc="Signalez les erreurs du RNB sur les bâtiments de notre carte."
                  linkProps={{
                    href: '/carte',
                  }}
                />
              </div>

              <div className="fr-col-12 fr-col-md-4">
                <CopyToClipboard
                  // @ts-ignore
                  onCopy={() => handleCopy()}
                  text={contactEmail}
                >
                  <Tile
                    imageUrl={mailIllu.src}
                    title={
                      emailCopied ? (
                        <span className={styles.copySuccess}>
                          Adresse copiée{' '}
                          <i className={fr.cx('fr-icon-success-fill')}></i>
                        </span>
                      ) : (
                        <span>Nous écrire</span>
                      )
                    }
                    imageSvg={false}
                    orientation="horizontal"
                    desc={`Envoyez-nous un message à ${contactEmail}`}
                    linkProps={{
                      href: '/contact',
                    }}
                  />
                </CopyToClipboard>
              </div>

              <div className="fr-col-12 fr-col-md-4">
                <Tile
                  imageUrl={appIllu.src}
                  title="Salon de discussion"
                  imageSvg={false}
                  orientation="horizontal"
                  desc="Rejoignez les salons de discussions du RNB."
                  linkProps={{
                    href: 'https://matrix.to/#/#rnb:matrix.org',
                  }}
                />
              </div>

              <div className="fr-col-12 fr-col-md-4">
                <Tile
                  imageUrl={internetIllu.src}
                  title="LinkedIn"
                  imageSvg={false}
                  orientation="horizontal"
                  desc="Suivez les actualités du RNB sur LinkedIn."
                  linkProps={{
                    href: 'https://www.linkedin.com/company/r-f-rentiel-national-des-b-timents/?originalSubdomain=fr',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
