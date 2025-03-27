'use client';

import { Input } from '@codegouvfr/react-dsfr/Input';
import { PasswordInput } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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

    const { hasErrors, errors, values } = prevalidateForm(e.target);

    setCreateAccountErrors(errors);
    if (hasErrors) {
      return;
    }

    const response = await fetch(
      process.env.NEXT_PUBLIC_API_BASE + '/auth/user/create/',
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

    const loginResult = await signIn('credentials', {
      username: values.username,
      password: values.password,
      redirect: false,
    });

    if (loginResult?.error) {
      throw new Error('Login following account creation did not work');
    }

    router.push('/votre-compte');
  };

  return (
    <form onSubmit={handleSubmit}>
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
