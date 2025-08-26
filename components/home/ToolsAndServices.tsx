'use client';
// Other illustrations
import rapprochementIllu from '@/public/images/rapprochement.png';
import apiIllu from '@/public/images/api.png';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/home.module.scss';

interface TabContent {
  image: string;
  description: string;
  links: {
    title: string;
    link: string;
  }[];
}

interface Tab {
  title: string;
  content: TabContent;
}

interface TabBoxProps {
  tabs: Tab[];
}

function TabBox({ tabs }: TabBoxProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.tabBox}>
      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tabButton} ${index === activeTab ? styles.active : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        <div className={styles.contentGrid}>
          <div className={styles.contentLeft}>
            <p className={styles.contentDescription}>
              {tabs[activeTab].content.description}
            </p>
            <ul className={styles.contentLinks}>
              {tabs[activeTab].content.links.map((link, index) => (
                <li key={index}>
                  <Link href={link.link || '#'} className={styles.contentLink}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.contentRight}>
            <Image
              src={tabs[activeTab].content.image}
              alt={tabs[activeTab].title}
              fill
              className={styles.contentImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToolsAndServices() {
  const toolBox = [
    {
      title: 'Intégrer',
      content: {
        image: rapprochementIllu.src,
        description:
          'Intégrez le RNB dans votre site web ou application mobile',
        links: [
          {
            title: 'Outils intéractifs',
            link: '',
          },
          {
            title: 'API et jeux de données',
            link: '',
          },
        ],
      },
    },
    {
      title: 'Consulter',
      content: {
        image: apiIllu.src,
        description: 'Consultez les données du RNB',
        links: [
          {
            title: 'Documentation de nos APIs',
            link: '',
          },
        ],
      },
    },
    {
      title: 'Alimenter',
      content: {
        image: rapprochementIllu.src,
        description: 'Alimentez le RNB avec vos données',
        links: [
          {
            title: 'Outils intéractifs',
            link: '',
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
          Découvrez les outils et services disponibles pour utiliser le RNB
        </p>
      </div>

      <TabBox tabs={toolBox} />
    </div>
  );
}
