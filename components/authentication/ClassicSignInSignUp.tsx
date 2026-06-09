import LoginForm from './LoginForm';
import CreateAccountForm from './CreateAccountForm';

type DisplayedForm = 'login' | 'signup';

interface ClassicSignInSignUpProps {
  displayedForm: DisplayedForm;
}

export default function ClassicSignInSignUp({
  displayedForm,
}: ClassicSignInSignUpProps) {
  return displayedForm === 'login' ? <LoginForm /> : <CreateAccountForm />;
}
