import { fr } from '@codegouvfr/react-dsfr';
import DBCard from './DBCard';
import { DiffusionDatabase } from './diffusionDatabase.type';

type Props = {
  databases: DiffusionDatabase[];
};

export default function DatabaseListSection({ databases }: Props) {
  return (
    <>
      <h2 id="liste" className="section__title">
        Les bases contenant des identifiants RNB
      </h2>
      <div className={fr.cx('fr-p-3w', 'fr-mb-4w')}>
        <p className="section__subtitle">
          Les ID-RNB sont présents dans de nombreuses bases, dont les plus
          grandes bases de l&apos;État. En voici quelques exemples.
        </p>
      </div>
      <div>
        {databases.map((database) => (
          <DBCard key={database.id} db={database} />
        ))}
      </div>
    </>
  );
}
