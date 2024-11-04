import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user.token;
        token.username = user.username;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
        session.username = token.username;
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
          const url = process.env.NEXT_PUBLIC_API_BASE + '/login/';

          const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 'Content-Type': 'application/json' },
          });

          if (!res.ok) {
            return null;
          }

          const user = await res.json();

          if (user) {
            return {
              ...user,
              username: credentials!.username,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
