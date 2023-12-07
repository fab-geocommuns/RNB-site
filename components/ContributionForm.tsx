export default function ContributionForm() {

    const url = process.env.NEXT_PUBLIC_API_BASE + '/contributions/';

    return (
        <form method="post" action={url}>
            <input type="text" className="fr-input" />
            <textarea className="fr-input"></textarea>
            <button type="submit" className="fr-btn fr-btn--sm" >Envoyer ma contribution</button>
        </form>
    )

}