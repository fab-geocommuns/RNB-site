'use client';

// Styles
import styles from '@/styles/dbcard.module.scss';

// Components
import ImageNext from 'next/image';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Table from '@codegouvfr/react-dsfr/Table';

// Analytics
import va from '@vercel/analytics';
import { DiffusionDatabase } from './diffusionDatabase.type';
import {
  HighlightToken,
  FuzzySearchAttributeResult,
} from './util/fuzzySearchAttributes';

const HighlightedText = ({
  text,
  tokens,
}: {
  text: string;
  tokens: HighlightToken[];
}) => {
  if (!tokens) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {tokens.map((token, i) =>
        token.isHighlighted ? (
          <span
            key={i}
            style={{ backgroundColor: 'yellow', borderRadius: '4px' }}
          >
            {token.token}
          </span>
        ) : (
          token.token
        ),
      )}
    </span>
  );
};

const AttributesTable = ({
  attributes,
}: {
  attributes: FuzzySearchAttributeResult[];
}) => {
  return (
    <Table
      className={styles.attributesTable}
      data={attributes.map((attribute, i) => [
        <HighlightedText
          key={i}
          text={attribute.name}
          tokens={attribute.nameTokens}
        />,
        <HighlightedText
          key={i}
          text={attribute.description}
          tokens={attribute.descriptionTokens}
        />,
      ])}
      hasHeader={false}
      size={'sm'}
      noCaption
    />
  );
};

type Props = {
  db: DiffusionDatabase;
  attributes: FuzzySearchAttributeResult[];
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

        <div className={styles.cardBody}>
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
