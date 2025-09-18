// Components
import styles from '@/styles/blog.module.scss';
import CasList from '@/components/CasListe';
import NewsletterForm from '@/components/NewsletterForm';
import { LogoGrid } from '@/components/home/UseCases';

export default async function Page() {
  return (
    <>
      <div className={styles.blog}>
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-pt-12v">
              <div className="fr-mb-8v">
                <h1 className="fr-mb-2v">Cas d&apos;usage</h1>
                <p>
                  <b>
                    Découvrez comment une variété d&apos;acteurs utilisent le
                    RNB pour conduire leurs politiques publiques et
                    territoriales
                  </b>
                </p>
              </div>
            </div>

            <div className="fr-col-12 fr-col-md-12">
              <CasList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
