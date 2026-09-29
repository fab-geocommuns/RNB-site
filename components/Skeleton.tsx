import { fr } from '@codegouvfr/react-dsfr';
import styles from '@/styles/skeleton.module.scss';

const { decisions } = fr.colors.getHex({ isDark: false });
const WHITE = decisions.background.default.grey.default;

type SkeletonProps = {
  width?: string;
  height: string;
  radius?: string;
  // Translucent white, for dark or colored backgrounds.
  onDark?: boolean;
};

// Loading placeholder: the DSFR has no skeleton component.
export default function Skeleton({
  width = '100%',
  height,
  radius = fr.spacing('1v'),
  onDark = false,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={styles.skeleton}
      style={
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: onDark
            ? `color-mix(in srgb, ${WHITE} 25%, transparent)`
            : decisions.background.contrast.grey.default,
          '--skeleton-highlight': WHITE,
        } as React.CSSProperties
      }
    />
  );
}
