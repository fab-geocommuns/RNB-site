import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    username?: string;
    groups?: string[];
    authProvider?: string;
    mfaSetupSuggested?: boolean;
  }

  interface User {
    token: string;
    username: string;
    groups: string[];
    authProvider?: string;
    mfa_setup_suggested?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    username?: string;
    groups?: string[];
    authProvider?: string;
    mfaSetupSuggested?: boolean;
  }
}
