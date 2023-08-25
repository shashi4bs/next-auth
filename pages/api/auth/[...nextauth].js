import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks:{
    async jwt({token, account}) {
      if(account){
        token.accessToken = account.access_token
      }
      return token;
    },
    async session({session, token, user}){
      session.accessToken = token.accessToken
      return session;
    }
  }
}

export default NextAuth(authOptions)