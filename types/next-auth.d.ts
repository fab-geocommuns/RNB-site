import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    username?: string;
    groups?: string[];
    authProvider?: string;
  }

  interface User {
    token: string;
    username: string;
    groups: string[];
    authProvider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    username?: string;
    groups?: string[];
    authProvider?: string;
  }
}
