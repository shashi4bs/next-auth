import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import {MongoDBAdapter} from "@auth/mongodb-adapter";
import {ElectroDBAdapter} from "../../../database/electroDBClient";
import connection from "../../../database/mongoClient";
import aws from "aws-sdk";

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
}); 

const client = new aws.DynamoDB.DocumentClient({region:"us-east-1"});


export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks:{
    async jwt({token, user, account}) {
      if(account){
        token.accessToken = account.access_token
      }
      return token;
    },
    async session({session, token, user}){
      console.log(session);      
      console.log(token);
      console.log(user);
      return session;
    }
  },
  adapter: ElectroDBAdapter(client)
}

export default NextAuth(authOptions)