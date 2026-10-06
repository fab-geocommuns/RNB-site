import { fr } from '@codegouvfr/react-dsfr';
import styles from '@/styles/summerGames.module.scss';
import Skeleton from '@/components/Skeleton';

const RANK_TABLES = ['departments', 'organizations', 'individuals'];
const RANK_ROWS = 10;
const NAME_WIDTHS = ['75%', '55%', '90%', '65%', '80%'];
// The first trophy description is one line longer, as on the real cards.
const TROPHY_DESC_WIDTHS = [
  ['90%', '85%', '90%', '40%'],
  ['90%', '85%', '60%'],
  ['90%', '85%', '60%'],
  ['90%', '85%', '60%'],
];

// One line of text in the typography of its parent: 1lh tall, bar at 0.8em.
function TextLine({
  width,
  centered = true,
  className,
}: {
  width: string;
  centered?: boolean;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: centered ? 'center' : 'flex-start',
        height: '1lh',
      }}
    >
      <Skeleton onDark width={width} height="0.8em" />
    </span>
  );
}

// Lines listed in mobileWidths only show below the md breakpoint, where the
// real text wraps more.
function TextLines({
  widths,
  mobileWidths = [],
}: {
  widths: string[];
  mobileWidths?: string[];
}) {
  return (
    <>
      {widths.map((width, index) => (
        <TextLine key={index} width={width} />
      ))}
      {mobileWidths.map((width, index) => (
        <TextLine
          key={`mobile-${index}`}
          width={width}
          className="fr-hidden-md"
        />
      ))}
    </>
  );
}

function SectionTitle({
  width,
  mobileWidths,
}: {
  width: string;
  mobileWidths?: string[];
}) {
  return (
    <div className={`fr-h3 ${styles.sectionTitle}`}>
      <TextLines widths={[width]} mobileWidths={mobileWidths} />
    </div>
  );
}

function TrophyCard({ descWidths }: { descWidths: string[] }) {
  return (
    <div className={styles.badge}>
      <div className={styles.badgeIcon}>
        <Skeleton
          onDark
          width={fr.spacing('10w')}
          height={fr.spacing('10w')}
          radius="50%"
        />
      </div>
      <div className={styles.badgeName} style={{ width: '100%' }}>
        <TextLine width="50%" />
      </div>
      <div className={styles.badgeCount} style={{ width: '100%' }}>
        <TextLine width="45%" />
      </div>
      <div className={styles.badgeDesc} style={{ width: '100%' }}>
        <TextLines widths={descWidths} />
      </div>
    </div>
  );
}

function RankTableSkeleton() {
  return (
    <div className={styles.rankShell}>
      <div className={styles.legend}>
        <TextLine width="70%" centered={false} />
      </div>
      <div className={styles.rankTable}>
        {Array.from({ length: RANK_ROWS }, (_, index) => (
          <div key={index} className={styles.rankRow}>
            <div className={styles.rankMedalShell}>
              <TextLine width={fr.spacing('3v')} centered={false} />
            </div>
            <div className={styles.rankNameShell}>
              <TextLine
                width={NAME_WIDTHS[index % NAME_WIDTHS.length]}
                centered={false}
              />
            </div>
            <div className={styles.rankCountShell}>
              <TextLine width={fr.spacing('4w')} centered={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading state of the summer game block: same shell and layout classes, so the
// real block replaces it with minimal shift.
export default function ClassementSkeleton({
  title,
  withEndFlag,
  withRankingTable,
  size,
}: {
  title: React.ReactNode;
  withEndFlag: boolean;
  withRankingTable: boolean;
  size: 'small' | 'large';
}) {
  return (
    <div
      aria-hidden="true"
      className={`section ${size === 'small' && styles.small} ${styles.seriousShell}`}
    >
      <div className={styles.shell}>
        <div className={styles.shellContent}>
          <div className={styles.titleblock}>
            <h2 className="section__title">{title}</h2>
            {withEndFlag && (
              <div className={styles.endFlagShell}>
                <span className={styles.endFlag}>Terminée</span>
              </div>
            )}
          </div>

          <div className={`section__subtitle ${styles.instruction}`}>
            <p className={styles.highlight}>
              <TextLines
                widths={['95%', '55%']}
                mobileWidths={['90%', '40%']}
              />
            </p>
          </div>

          <SectionTitle
            width={`calc(${fr.spacing('16w')} * 3)`}
            mobileWidths={['60%']}
          />

          <div className={styles.progressShell}>
            <div className={styles.barShell}>
              <div className={styles.legend}>
                <TextLines
                  widths={[`calc(${fr.spacing('16w')} * 2.5)`]}
                  mobileWidths={['50%']}
                />
              </div>
              <div className={styles.bar}>
                <Skeleton onDark height="100%" radius={fr.spacing('1w')} />
              </div>
            </div>

            <SectionTitle width={fr.spacing('12w')} />

            <div className={styles.badges}>
              <div className={styles.badgesGrid}>
                {TROPHY_DESC_WIDTHS.map((descWidths, index) => (
                  <TrophyCard key={index} descWidths={descWidths} />
                ))}
              </div>
            </div>

            <SectionTitle width={fr.spacing('15w')} />

            {withRankingTable && (
              <div className={styles.ranks}>
                {RANK_TABLES.map((table) => (
                  <div key={table} className={styles.ranksTable}>
                    <RankTableSkeleton />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.buttonsShell}>
            <Skeleton
              onDark
              width={`calc(${fr.spacing('16w')} + ${fr.spacing('5v')})`}
              height={fr.spacing('6w')}
              radius="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
