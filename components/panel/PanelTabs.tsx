import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import { fr } from '@codegouvfr/react-dsfr';

export default function PanelTabs() {
const pathName = usePathname();
const searchParams = useSearchParams();
const tabIsActive = (route: string): boolean => {
    return pathName === route;
};
const router = useRouter();

  return <SegmentedControl
    hideLegend
    classes={{
        root: fr.cx('fr-mb-2w'),
        elements: fr.cx('fr-col-12'),
        'element-each': fr.cx('fr-col-6')
    }}
    segments={[
        {
        iconId: 'fr-icon-road-map-line',
        label: 'Informations',
        nativeInputProps: {
            checked: tabIsActive('/carte'),
            onChange: () => {
                router.push(`/carte?${searchParams.toString()}`);
            }
        }
        },
        {
        iconId: 'fr-icon-road-map-line',
        label: 'Edition',
        nativeInputProps: {
            checked: tabIsActive('/edition'),
            onChange: () => {
                router.push(`/edition?${searchParams.toString()}`);
            }
        }
        }
    ]}
  />;
}