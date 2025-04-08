// Lib
import { getPosts } from '@/utils/blog';

// Comps
import Link from 'next/link';
import ArticleCard from '@/components/blog/ArticleCard';
import NewsletterForm from '@/components/NewsletterForm';

// Style
import styles from '@/styles/blog.module.scss';

// SEO
import { Metadata } from 'next';

export const revalidate = 10;

export const metadata: Metadata = {
  title: 'Actualités du Référentiel National des Bâtiments',
  description:
    'Suivez la construction et la diffusion du Référentiel National des Bâtiments.',
};

async function getData(page: number) {
  const posts = await getPosts(page);
  return posts;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  const page = searchParams?.page || 1;
  const posts = await getData(page);

  const nextPageUrl = function () {
    if (posts?.meta.pagination.next) {
      return '/blog?page=' + posts.meta.pagination.next;
    }
    return null;
  };
  const prevPageUrl = function () {
    if (posts?.meta.pagination.prev) {
      return '/blog?page=' + posts.meta.pagination.prev;
    }
    return null;
  };

  return (
    <>
      <div className={styles.blog}>
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-pt-12v">
              <div className="fr-mb-8v">
                <h1 className="fr-mb-2v">Les actualités du RNB</h1>
                <p>
                  <b>
                    Consultez les nouveautés et les dernières fonctionnalités du
                    RNB.
                  </b>
                </p>
              </div>
            </div>

            <div className="fr-col-12 fr-col-md-8">
              <div>
                // @ts-ignore
                {posts?.map((post) => (
                  <div key={post.id} className="fr-mb-8v">
                    <ArticleCard post={post}></ArticleCard>
                  </div>
                ))}
              </div>

              <div className={styles.pagination}>
                {prevPageUrl() && (
                  <Link
                    className="fr-btn fr-btn--secondary"
                    // @ts-ignore
                    href={prevPageUrl()}
                  >
                    &larr; Page précédente
                  </Link>
                )}
                {nextPageUrl() && (
                  <Link
                    className="fr-btn fr-btn--secondary"
                    // @ts-ignore
                    href={nextPageUrl()}
                  >
                    Page suivante &rarr;
                  </Link>
                )}
              </div>
            </div>
            <div className="fr-col-12 fr-col-md-4">
              <div>
                <div className="fr-card fr-mb-6v">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h4 className={`fr-card__title ${styles.pressListTitle}`}>
                        Dans la presse
                      </h4>
                      <div className="fr-card__desc">
                        <ul className={styles.pressList}>
                          <li>
                            Référentiel national des bâtiments : un dénominateur
                            commun pour tous les services
                            <br />
                            <a href="https://www.lagazettedescommunes.com/920903/referentiel-national-des-batiments-un-denominateur-commun-pour-tous-les-services/">
                              La Gazette des communes
                            </a>
                          </li>
                          <li>
                            Rénovation des bâtiments : le RNB (Référentiel
                            National des Bâtiments) est en ligne
                            <br />
                            <a href="https://www.smartcitymag.fr/article/1410/renovation-des-batiments-le-rnb-referentiel-national-des-batiments-est-en-ligne">
                              Smart City Mag
                            </a>
                          </li>
                          <li>
                            Gestion des bâtiments : un nouvel outil à
                            destination des services publics
                            <br />
                            <a href="https://acteurspublics.fr/articles/gestion-des-batiments-un-nouvel-outil-a-destination-des-services-publics">
                              Acteurs publics
                            </a>
                          </li>
                          <li>
                            À chaque bâtiment son identifiant unique
                            <br />
                            <a href="https://www.lemoniteur.fr/article/a-chaque-batiment-son-identifiant-unique.2326464">
                              Le Moniteur
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="fr-card">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h4 className={`fr-card__title ${styles.pressListTitle}`}>
                        Nous suivre
                      </h4>
                      <div className="fr-card__desc">
                        <div className="fr-mb-2v">
                          <p>
                            Restez informé des actualités du RNB en vous
                            inscrivant à l&apos;infolettre ou en nous suivant
                            sur{' '}
                            <a href="https://www.linkedin.com/company/r-f-rentiel-national-des-b-timents/">
                              LinkedIn
                            </a>
                            .
                          </p>
                          <NewsletterForm />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
