import { Input } from '@codegouvfr/react-dsfr/Input';
import { PasswordInput } from '@codegouvfr/react-dsfr/blocks/PasswordInput';

export default function CreateAccountForm() {
  return (
    <div className="fr-p-1w">
      Je n'ai pas encore de compte
      <h3>Créer un compte</h3>
      <form>
        <Input
          label="Email"
          hintText="Ne sera pas visible publiquement sur le site"
          nativeInputProps={{
            type: 'email',
          }}
        />
        <Input label="Nom d'utilisateur" state="default" />
        <Input label="Nom" state="default" />
        <Input label="Prénom" state="default" />
        <Input
          label="Organisation pour laquelle vous travaillez"
          state="default"
        />
        <Input label="Votre fonction" state="default" />
        <PasswordInput label="Mot de passe" />
        <PasswordInput label="Confirmation du mot de passe" />
        <button className="fr-btn" type="submit">
          Créer un compte
        </button>
      </form>
    </div>
  );
}
