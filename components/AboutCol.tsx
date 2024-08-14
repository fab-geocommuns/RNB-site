// Comps
import { Tile } from '@codegouvfr/react-dsfr/Tile';

// Logos
import toolsIllu from '@/public/images/tools-illu.svg';
import defIllu from '@/public/images/definition-illu.svg';
import casIllu from '@/public/images/cas-illu.svg';
import faqIllu from '@/public/images/faq-illu.svg';

export default function AboutCol() {
  return (
    <>
      <Tile
        desc="Nous mettons à disposition des outils gratuits pour consulter le référentiel et l'intégrer à vos outils et systèmes."
        imageUrl={toolsIllu.src}
        imageSvg={false}
        title="Utiliser le RNB"
        linkProps={{
          href: '/outils-services',
        }}
        className="fr-mb-12v"
      />

      <Tile
        imageUrl={casIllu.src}
        imageSvg={false}
        title="Voir tous les cas"
        linkProps={{
          href: '/cas',
        }}
        className="fr-mb-12v"
      />

      <Tile
        imageUrl={defIllu.src}
        imageSvg={false}
        title="Définition du bâtiment"
        linkProps={{
          href: '/definition',
        }}
        className="fr-mb-12v"
      />

      <Tile
        imageUrl={faqIllu.src}
        imageSvg={false}
        title="Foire aux questions"
        linkProps={{
          href: '/faq',
        }}
        className="fr-mb-12v"
      />
    </>
  );
}
