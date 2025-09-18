'use client';
// Other illustrations
import rapprochementIllu from '@/public/images/rapprochement.png';
import apiIllu from '@/public/images/api.png';
import adsIllu from '@/public/images/ads.png';
import { useState } from 'react';
import styles from '@/styles/home.module.scss';
import Card from '@codegouvfr/react-dsfr/Card';

interface TabContent {
  image: string;
  description: React.ReactNode;
  links: {
    title: string;
    link: string;
  }[];
}

interface Tab {
  title: string;
  content: TabContent;
  icon: React.ReactNode;
}

interface TabBoxProps {
  tabs: Tab[];
}

function TabBox({ tabs }: TabBoxProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.tabBox}>
      <div className={styles.tabNavigation}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tabButton} ${index === activeTab ? styles.active : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.icon} {tab.title}
          </button>
        ))}
      </div>

      <Card
        title={null}
        desc={tabs[activeTab].content.description}
        horizontal={true}
        className={styles.tabContent}
        footer={
          <ul className="fr-links-group">
            {tabs[activeTab].content.links.map((link, index) => (
              <li key={index}>
                <a
                  className="fr-link fr-icon-arrow-right-line fr-link--icon-right"
                  href={link.link}
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        }
        size="medium"
        imageUrl={tabs[activeTab].content.image}
        imageAlt={tabs[activeTab].title}
      />
    </div>
  );
}

export default function ToolsAndServices() {
  const toolBox = [
    {
      title: 'Consulter',
      icon: '📖',
      content: {
        image: rapprochementIllu.src,
        description: (
          <>
            <b>Consultez les données libres et ouvertes du RNB</b>, directement
            sur la carte ou via nos APIs et jeux de données.
          </>
        ),
        links: [
          {
            title: 'Carte des bâtiments',
            link: '/carte',
          },
          {
            title: 'Documentation de nos APIs',
            link: '/doc',
          },
          {
            title: 'Définition et standard',
            link: '/definition',
          },
        ],
      },
    },
    {
      title: 'Intégrer',
      icon: '🔌',
      content: {
        image: apiIllu.src,
        description: (
          <>
            Vous produisez ou exploitez des données bâtimentaires ?<br />
            <b>Intégrez le RNB dans votre flux</b>, directement sur votre
            application ou via un processus de traitement.
          </>
        ),
        links: [
          {
            title: 'API et jeux de données',
            link: '/doc',
          },
          {
            title: 'Selecteur de bâtiments',
            link: 'https://rnb-fr.gitbook.io/documentation/exemples/selecteur-de-batiments',
          },
          {
            title: 'Définition et standard',
            link: '/definition',
          },
        ],
      },
    },
    {
      title: 'Contribuer',
      icon: '🔄',
      content: {
        image: adsIllu.src,
        description: (
          <>
            <b>Partagez la connaissance de votre territoire</b> et bénéficiez en
            retour des améliorations apportées par la communauté pour une donnée
            bâtimentaire la plus proche du terrain !
          </>
        ),
        links: [
          {
            title: "API d'édition",
            link: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb',
          },
          {
            title: 'Carte interactive',
            link: '/edition',
          },
          {
            title: "Guide d'édition",
            link: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb',
          },
        ],
      },
    },
  ];
  return (
    <div className="section">
      <div className="section__titleblock">
        <h2 className="section__title">Outils et services</h2>
        <p className="section__subtitle">
          Utilisez le RNB au sein de vos outils et bases de données
        </p>
      </div>

      <TabBox tabs={toolBox} />
    </div>
  );
}
