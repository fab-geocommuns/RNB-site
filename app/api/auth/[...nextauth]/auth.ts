import CredentialsProvider from 'next-auth/providers/credentials';
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import type { NextAuthOptions, User } from 'next-auth';
import { getServerSession } from 'next-auth';
import { rnbApi } from '@/utils/rnbApi';

export const authOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user.token;
        token.username = user.username;
        token.groups = user.groups;
        token.authProvider = user.authProvider;
      }

      return token;
    },

    session: async ({ session, token }) => {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
        session.username = token.username;
        session.groups = token.groups;
        session.authProvider = token.authProvider;
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
      },
      async authorize(credentials) {
        try {
          // We send the credentials to the login API
          return await rnbApi.post<User>('/login/', credentials);
        } catch (error) {
          console.error('Auth error:', error);
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
