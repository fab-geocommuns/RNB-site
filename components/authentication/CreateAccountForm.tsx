'use client';

import { Input } from '@codegouvfr/react-dsfr/Input';
import { PasswordInput } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@codegouvfr/react-dsfr/Alert';

type CreateAccountErrors = {
  email: string[];
  username: string[];
  lastName: string[];
  firstName: string[];
  password: string[];
  confirmPassword: string[];
};

const noErrors: () => CreateAccountErrors = () => ({
  email: [],
  username: [],
  lastName: [],
  firstName: [],
  password: [],
  confirmPassword: [],
});

export default function CreateAccountForm() {
  const [createAccountErrors, setCreateAccountErrors] = useState(noErrors());
  const [genericError, setGenericError] = useState(false);
  const [success, setSuccess] = useState(false);

  const clearError = (field: keyof CreateAccountErrors) => {
    setCreateAccountErrors({
      ...createAccountErrors,
      [field]: [],
    });
  };

  const prevalidateForm = (formElement: HTMLFormElement) => {
    const formData = new FormData(formElement);
    const email = formData.get('email');
    const username = formData.get('username');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const lastName = formData.get('lastName');
    const firstName = formData.get('firstName');

    const errors: CreateAccountErrors = noErrors();
    const values = {
      email: email as string,
      username: username as string,
      password: password as string,
      confirmPassword: confirmPassword as string,
      lastName: lastName as string,
      firstName: firstName as string,
    };

    if (password !== confirmPassword) {
      errors.confirmPassword = ['Les mots de passe ne correspondent pas'];
    }

    return {
      hasErrors: Object.values(errors).some((error) => error.length > 0),
      errors,
      values,
    };
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setGenericError(false);
    setSuccess(false);

    const { hasErrors, errors, values } = prevalidateForm(e.target);

    setCreateAccountErrors(errors);
    if (hasErrors) {
      return;
    }

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE + '/auth/users/',
        {
          method: 'POST',
          body: JSON.stringify({
            email: values.email,
            username: values.username,
            password: values.password,
            last_name: values.lastName,
            first_name: values.firstName,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();

        setCreateAccountErrors({
          ...createAccountErrors,
          email: data.email || [],
          username: data.username || [],
          lastName: data.last_name || [],
          firstName: data.first_name || [],
          confirmPassword: data.password || [],
        });
        return;
      }

      if (response.status !== 201) {
        throw new Error('Account creation did not return a 201 status code');
      }

      setSuccess(true);
    } catch (error) {
      setSuccess(false);
      setGenericError(true);
      throw error;
    }
  };

  if (success) {
    return (
      <div className="fr-mb-3w">
        <Alert
          description={
            <div>
              Votre compte a été créé et un e-mail de confirmation vous a été
              envoyé.
              <br />
              <strong>Validez votre adresse email</strong> en cliquant sur le
              lien dans l&apos;email pour continuer.
            </div>
          }
          severity="success"
          closable={false}
          small={true}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {genericError && (
        <div className="fr-mb-3w">
          <Alert
            description="Une erreur est survenue lors de la création de votre compte"
            severity="error"
            closable={false}
            small={true}
          />
        </div>
      )}
      <Input
        label="Email"
        nativeInputProps={{
          name: 'email',
          type: 'email',
          required: true,
          onChange: (e) => clearError('email'),
        }}
        hintText="Ne sera pas visible publiquement sur le site"
        state={createAccountErrors.email.length > 0 ? 'error' : 'default'}
        stateRelatedMessage={createAccountErrors.email}
      />
      <Input
        label="Nom d'utilisateur"
        nativeInputProps={{
          name: 'username',
          required: true,
          onChange: (e) => clearError('username'),
        }}
        state={createAccountErrors.username.length > 0 ? 'error' : 'default'}
        stateRelatedMessage={createAccountErrors.username}
      />
      <Input
        label="Nom"
        nativeInputProps={{
          name: 'lastName',
          onChange: (e) => clearError('lastName'),
        }}
        state={createAccountErrors.lastName.length > 0 ? 'error' : 'default'}
        stateRelatedMessage={createAccountErrors.lastName}
      />
      <Input
        label="Prénom"
        nativeInputProps={{
          name: 'firstName',
          onChange: (e) => clearError('firstName'),
        }}
        state={createAccountErrors.firstName.length > 0 ? 'error' : 'default'}
        stateRelatedMessage={createAccountErrors.firstName}
      />
      <PasswordInput
        label="Mot de passe"
        nativeInputProps={{
          name: 'password',
          required: true,
          onChange: (e) => clearError('password'),
        }}
      />
      <PasswordInput
        label="Confirmation du mot de passe"
        messagesHint=""
        messages={createAccountErrors.confirmPassword.map((errorMessage) => ({
          severity: 'error',
          message: errorMessage,
        }))}
        nativeInputProps={{
          name: 'confirmPassword',
          required: true,
          onChange: (e) => clearError('confirmPassword'),
        }}
      />
      <button className="fr-btn fr-mt-2w" type="submit">
        Créer un compte
      </button>
    </form>
  );
}
