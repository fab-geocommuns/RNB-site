'use client';

// Styles
import styles from '@/styles/dbcard.module.scss';

// Components
import ImageNext from 'next/image';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Table from '@codegouvfr/react-dsfr/Table';

// Analytics
import va from '@vercel/analytics';
import { DiffusionDatabase, Attribute } from './diffusionDatabase.type';

const AttributesTable = ({ attributes }: { attributes: Attribute[] }) => {
  return (
    <Table
      className={styles.attributesTable}
      data={attributes.map((attribute) => [
        attribute.name,
        attribute.description,
      ])}
      hasHeader={false}
      size={'sm'}
      noCaption
    />
  );
};

type Props = {
  db: DiffusionDatabase;
  attributes: Attribute[];
  displayAttributes: boolean;
};

export default function Entry({ db, attributes, displayAttributes }: Props) {
  const trackDbClick = (db: DiffusionDatabase) => {
    return () => {
      va.track('db-click-on-page', {
        db_name: db.name,
      });
    };
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.logoShell}>
          <ImageNext
            className={styles.logo}
            width="30"
            height="30"
            src={db.image_url || ''}
            alt={db.name}
            placeholder="empty"
          />
        </div>

        <div className={styles.body}>
          <div className={styles.titleBlock}>
            <h3 className={styles.title}>
              <a onClick={trackDbClick(db)} href={db.documentation_url}>
                {db.name}
              </a>
            </h3>
            <div className={styles.meta}>
              <span>Editée par {db.publisher}</span>
              <span>{db.licence}</span>
            </div>
          </div>

          {!displayAttributes && (
            <p className={styles.description}>{db.description}</p>
          )}
          {displayAttributes && <AttributesTable attributes={attributes} />}

          <div>
            {db.tags.map((tag) => (
              <span className={styles.tagShell} key={tag}>
                <Badge severity="info" noIcon small>
                  {tag}
                </Badge>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
