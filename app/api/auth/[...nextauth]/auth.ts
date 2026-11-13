import CredentialsProvider from 'next-auth/providers/credentials';
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import type { NextAuthOptions, User } from 'next-auth';
import { getServerSession } from 'next-auth';
import { rnbApi, RnbApiError } from '@/utils/rnbApi';
import { mfaErrorOf } from '@/utils/mfa';

export const authOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user.token;
        token.username = user.username;
        token.groups = user.groups;
        token.authProvider = user.authProvider;
        token.mfaSetupSuggested = user.mfa_setup_suggested;
      }

      return token;
    },

    session: async ({ session, token }) => {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
        session.username = token.username;
        session.groups = token.groups;
        session.authProvider = token.authProvider;
        session.mfaSetupSuggested = token.mfaSetupSuggested;
      }

      return session;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { username, password, otp } = credentials;
        try {
          return await rnbApi.post<User>('/login/', {
            username,
            password,
            ...(otp ? { otp } : {}),
          });
        } catch (error) {
          // Thrown errors reach the login form as `signIn(...).error`
          const mfaError = mfaErrorOf(error);
          if (mfaError) {
            throw new Error(mfaError);
          }
          // Identifiants refusés par l'API (4xx) : cas attendu, pas une erreur
          // à logger. Une panne de l'API (5xx) doit en revanche remonter.
          if (!(error instanceof RnbApiError) || error.status >= 500) {
            console.error('Auth error:', error);
          }
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: 'mfa-enrollment',
      name: 'MFA enrollment',
      credentials: {
        code: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.code) {
          return null;
        }

        try {
          // One-time code returned by /auth/mfa/confirm/, the only proof of the password and the first code
          const user = await rnbApi.post<User>('/auth/pro_connect/exchange/', {
            code: credentials.code,
          });

          return { ...user, id: String(user.id) };
        } catch (error) {
          console.error('MFA enrollment exchange error:', error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: 'proconnect',
      name: 'ProConnect',
      credentials: {
        code: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.code) {
          return null;
        }

        try {
          // Server-side exchange of the one-time code: the token never transits in a URL
          const user = await rnbApi.post<User>('/auth/pro_connect/exchange/', {
            code: credentials.code,
          });

          return { ...user, id: String(user.id), authProvider: 'proconnect' };
        } catch (error) {
          console.error('ProConnect exchange error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/connexion',
  },
} satisfies NextAuthOptions;

export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
