import CredentialsProvider from 'next-auth/providers/credentials';
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';

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
          const url = process.env.NEXT_PUBLIC_API_BASE + '/login/';
          const distantLoginResponse = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 'Content-Type': 'application/json' },
          });

          if (!distantLoginResponse.ok) {
            return null;
          }

          const user = await distantLoginResponse.json();

          return user;
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
          const url =
            process.env.NEXT_PUBLIC_API_BASE + '/auth/pro_connect/exchange/';
          const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ code: credentials.code }),
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();

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
