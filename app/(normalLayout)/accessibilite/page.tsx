// Settings
import settings from '@/logic/settings'
const contactEmail = settings.contactEmail;

export default function Page() {
  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row ">
          <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1 fr-pt-12v">
          
          <h1>Déclaration d’accessibilité</h1>
<p>Établie le <span>24 janvier 2024</span>.</p>
<p><span>Institut national de l&apos;information géographique et forestière</span> s&apos;engage à rendre son service accessible, conformément à l&apos;article 47 de la loi n° 2005-102 du 11 février 2005.</p>
<p>Cette déclaration d&apos;accessibilité s&apos;applique à <strong>Référentiel National des Bâtiments</strong><span> (<span>https://rnb.beta.gouv.fr/</span>)</span>.</p>
<h2>État de conformité</h2>
<p>
	<strong>Référentiel National des Bâtiments</strong> est <strong><span data-printfilter="lowercase">non conforme</span></strong> avec le <abbr title="Référentiel général d’amélioration de l’accessibilité">RGAA</abbr>. <span>Le site n&apos;a encore pas été audité.</span>
</p>

<h2>Contenus non accessibles</h2>
<h2>Amélioration et contact</h2>
<p>Si vous n&apos;arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable de <span>Référentiel National des Bâtiments</span> pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme.</p>
<ul>
	<li>
	E-mail&nbsp;: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
</li>

	<li>
	Formulaire de contact&nbsp;: <a href="https://rnb.beta.gouv.fr/contact">https://rnb.beta.gouv.fr/contact</a>
</li>
	<li>
	Adresse&nbsp;: <span>73 avenue de Paris, 94165, Saint Mandé</span>
</li>
</ul>
<h2>Voie de recours</h2>
<p>Cette procédure est à utiliser dans le cas suivant&nbsp;: vous avez signalé au responsable du site internet un défaut d&apos;accessibilité qui vous empêche d&apos;accéder à un contenu ou à un des services du portail et vous n&apos;avez pas obtenu de réponse satisfaisante.</p>
<p>Vous pouvez&nbsp;:</p>
<ul>
	<li>Écrire un message au <a href="https://formulaire.defenseurdesdroits.fr/">Défenseur des droits</a></li>
	<li>Contacter <a href="https://www.defenseurdesdroits.fr/saisir/delegues">le délégué du Défenseur des droits dans votre région</a></li>
	<li>Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre)&nbsp;:<br /> 
	Défenseur des droits<br />
	Libre réponse 71120 75342 Paris CEDEX 07</li>
</ul>
<p>
	Cette déclaration d&apos;accessibilité a été créé le <span>24 janvier 2024</span> grâce au <a href="https://betagouv.github.io/a11y-generateur-declaration/#create">Générateur de Déclaration d&apos;Accessibilité de BetaGouv</a>.
</p>

          </div>
        </div>
      </div>
    </>
  );
}
