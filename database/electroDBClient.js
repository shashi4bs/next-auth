import DynamoDB from "aws-sdk/clients/dynamodb";
import crypto from "crypto";
import { Entity } from 'electrodb';
import { version } from "os";
import { use } from "react";

const format = {
  /** Takes a plain old JavaScript object and turns it into a Dynamodb object */
  to(object) {
      const newObject = {};
      for (const key in object) {
          const value = object[key];
          if (value instanceof Date) {
              // DynamoDB requires the TTL attribute be a UNIX timestamp (in secs).
              if (key === "expires")
                  newObject[key] = value.getTime() / 1000;
              else
                  newObject[key] = value.toISOString();
          }
          else
              newObject[key] = value;
      }
      return newObject;
  },
  /** Takes a Dynamo object and returns a plain old JavaScript object */
  from(object) {
      if (!object)
          return null;
      const newObject = {};
      for (const key in object) {
          // Filter DynamoDB specific attributes so it doesn't get passed to core,
          // to avoid revealing the type of database
          if (["pk", "sk", "GSI1PK", "GSI1SK"].includes(key))
              continue;
          const value = object[key];
          if (isDate(value))
              newObject[key] = new Date(value);
          // hack to keep type property in account
          else if (key === "type" && ["SESSION", "VT", "USER"].includes(value))
              continue;
          // The expires property is stored as a UNIX timestamp in seconds, but
          // JavaScript needs it in milliseconds, so multiply by 1000.
          else if (key === "expires" && typeof value === "number")
              newObject[key] = new Date(value * 1000);
          else
              newObject[key] = value;
      }
      return newObject;
  },
};

export function ElectroDBAdapter(
  client,
  options={}
) {
  const table = "next-auth";
  const pk = options?.partitionKey ?? "pk";
  const sk = options?.sortKey ?? "sk";
  const IndexName = options?.indexName ?? "GSI1";
  const GSI1PK = options?.indexPartitionKey ?? "GSI1PK";
  const GSI1SK = options?.indexSortKey ?? "GSI1SK";
  console.log("ElectroDBAdapter called!");
  const AuthUser = new Entity({
    model: {
      entity: "user",
      version: '1',
      service: "auth-electro"
    },
    attributes:{
      [pk]:{
        type: "string"
      },
      [sk]:{
        type: "string"
      },
      id: {
        type: "string"
      },
      email: {
        type: "string"
      },
      emailVerified: {
        type: "string"
      }
    },
    indexes:{
      byId: {
        pk: {
          field: 'pk1',
          composite: ['pk']
        }
      }
    }
  }, {client, table});

  return {
    async createUser(data) {
      /**
       * Create Schema
       * Create user as oer schema
       * populate using .go
       */
      const user = {
        ...data,
        id: crypto.randomUUID()
      }
      console.log("creating user ", user);
      if(user['emailVerified'])
        user['emailVerified'] = user[emailVerified].toISOString();
      else
        user['emailVerified'] = "null";
      console.log({
        ...user,
        [pk]: `USER#${user.id}`,
        [sk]: `USER#${user.id}`,
        type: "USER",
        [GSI1PK]: `USER#${user.email}`,
        [GSI1SK]: `USER#${user.email}`,
      });
      await AuthUser.put({
        ...user,
        [pk]: `USER#${user.id}`,
        [sk]: `USER#${user.id}`,
        type: "USER",
        [GSI1PK]: `USER#${user.email}`,
        [GSI1SK]: `USER#${user.email}`,
      }).go();
      console.log("user created ", user);
      return user;
    },

    async getUser(userId) {
      console.log("Inside getUser");
      const data = await AuthUser.get({
        [pk]: `USER#${userId}`,
        [sk]: `USER#${userId}`
      }).go();
      return data;
    },
    async getUserByEmail(email){
      console.log("Inside getUser by email");
      const data = await AuthUser.find({
        GSI1PK: `USER#${email}`
      }).go();
      console.log("read data: ", data);
      if(!data.length) return null;
      return data;
    },
    async getUserByAccount({provider, providerAccountId}) {
      console.log("Inside getUserByAccount");
      
      const data = await AuthUser.find({
        GSI1PK: `ACCOUNT#${provider}`,
        GSI1SK: `ACCOUNT#${providerAccountId}`
      }).go();
      console.log("received data: ", data);
      if(!data.length) return null;
      const account = data[0];
      const res = AuthUser.get({
        pk: `USER#${account.userId}`,
        sk: `USER#${account.userId}`
      }).go();
      return res;
    },
    async updateUser(user){
      console.log("Inside updateUser");
      return await AuthUser.update({
        [pk]: `USER#${user.id}`,
        [sk]: `USER#${user.id}`
      }).set(...user)
      .go();
    },
    async deleteUser(userId){
      console.log("Inside deleteUser");
      const res = await AuthUser.delete({
        id: userId
      }).go();
      return res;
    },
    async linkAccount(data){
      console.log("Inside linkAccount");
      const res = await AuthUser.create({
        ...data,
        id: crypto.randomUUID(),
        [pk]: `USER#${data.userId}`,
        [sk]: `ACCOUNT#${data.provider}#${data.providerAccountId}`,
        [GSI1PK] : `ACCOUNT#${data.provider}`,
        [GSI1SK] : `ACCOUNT#${data.providerAccountId}`
      }).go();
      return res;
    },
    async unlinkAccount({provider, providerAccountId}) {
      console.log("Inside unlink Account");
      const data = await AuthUser.get({
        GSI1PK: `ACCOUNT#${provider}`,
        GSI1SK: `ACCOUNT#${providerAccountId}`
      }).go();
      const account = data[0];
      await AuthUser.delete({
        [pk]: `USER#${account.userId}`,
        [sk]: `ACCOUNT#${provider}#${providerAccountId}`
      }).go();
      return account;
    },
    async getSessionAndUser(sessionToken){
      console.log("Inside getSessionAndUser");
      let data = await AuthUser.find({
        [GSI1PK]: `SESSION#${sessionToken}`,
        [GSI1SK]: `SESSION#${sessionToken}`
      }).go();
      data = data['data'];
      console.log("received data, ", data[0]);
      if(!data.length) return null;
      const session = data[0];
      const user = await AuthUser.find({
        [pk]: `USER#${session.userId}`,
        [sk]: `USER#${session.userId}`
      }).go();
      console.log("received user: ", user);
      if(!user.length) return null;
      return { user, session}
    },
    async createSession(data){
      console.log("Inside createSession");
      const session = {
        id: crypto.randomUUID(),
        ...data 
      }
      console.log(session);
      await AuthUser.create({
        [pk]: `USER#${data.userId}`,
        [sk]: `SESSION#${data.sessionToken}`,
        [GSI1PK]: `SESSION#${data.sessionToken}`,
        [GSI1SK]: `SESSION#${data.sessionToken}`,
        type: "SESSION",
        ...data
      }).go();
      return session; 
    },
    async updateSession(session){
      console.log("Inside updateSession");
      const {sessionToken} = session;
      const data = await AuthUser.get({
        GSI1PK: `SESSION#${sessionToken}`,
        GSI1SK: `SESSION#${sessionToken}`
      }).go();
      const [pk, sk] = data[0];
      return await AuthUser.update({
        [pk]: pk,
        [sk]: sk
      }).set(
        ...session
      ).go();
    },
    async deleteSession(sessionToken){
      console.log("Inside deleteSession");
      const data = AuthUser.get({
        GSI1PK: `SESSION#${sessionToken}`,
        GSI1SK: `SESSION#${sessionToken}`
      }).go();
      if(!data) return null;
      const [pk, sk] = data[0];
      const res=await AuthUser.delete({
        [pk]: pk,
        [sk]: sk
      }).go();
      return res;
    },
    async createVerificationToken(data){
      console.log("Inside createVerificationToken");
      await AuthUser.create({
        [pk]: `VT#${data.identifier}`,
        [sk]: `VT#${data.token}`,
        type: "VT",
        ...data
      }).go();
      return data;
    },
    async useVerificationToken({identifier, token}){
      console.log("Inside useVerificationToken")
      const data = await AuthUser.delete({
        [pk]: `VT#${identifier}`,
        [sk]: `VT#${token}`
      }).go();
      return data;
    }
  }
}