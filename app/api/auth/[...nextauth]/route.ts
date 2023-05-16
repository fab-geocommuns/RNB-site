import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"


export const authOptions = {
  
  callbacks: {
    jwt: async (e) => {
      
      if (e?.user && e?.token) {
        e.token.accessToken = e.user.token
      }

      return e.token
      
    },
    session: async (e) => {

      if (!e.session) {
        return
      }
      
      if (e?.token?.accessToken) {
        e.session.accessToken = e.token.accessToken
      }
      
      return Promise.resolve(e.session)
    }
  },
  providers: [
      CredentialsProvider({
        id: 'credentials',
        // The name to display on the sign in form (e.g. 'Sign in with...')
        name: 'Credentials',
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
          username: { label: "Username", type: "text", placeholder: "jsmith" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials, req) {
          // You need to provide your own logic here that takes the credentials
          // submitted and returns either a object representing a user or value
          // that is false/null if the credentials are invalid.
          // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
          // You can also use the `req` object to obtain additional parameters
          // (i.e., the request IP address)

          const url = process.env.NEXT_PUBLIC_API_BASE + '/login/'

          const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          })
          const user = await res.json()
    
          // If no error and we have user data, return it
          if (res.ok && user) {

            return user
          }
          // Return null if user data could not be retrieved
          return null
        }
      })
    ],
    pages: {
      signIn: '/login'
    },
 
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }