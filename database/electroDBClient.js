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

  const User = new Entity({
    model: {
      service: "USER",
      entity: "USER",
      version: "1"
    },
    attributes: {
      id: {
        type:"string"
      },
      email: {
        type: "string"
      },
      emailVerified: {
        type: "string"
      }
    },
    indexes: {
      byUser:{
        pk: {
          field: "pk",
          composite: ["id"]
        },
        sk: {
            field: "sk",
            composite: ["id"]
        }
      },
      byEmail:{
        index: "gsi1pk-gsi1sk-index",
        pk: {
            field: "gsi1pk",
            composite: ["email"]
        },
        sk: {
            field: "gsi1sk",
            composite: ["email"]
        }
      }
    }
  }, {client, table});

  const Session = new Entity({
    model:{
      service: "USER",
      entity: "SESSION",
      version: "1"
    },
    attributes:{
      id: {
        type: "string"
      },
      sessionToken: {
        type: "string"
      },
      userId: {
        type: "string"
      },
      type: {
        type: "string"
      },
      expires: {
        type: "string"
      }
    },
    indexes:{
      byToken: {
        pk:{
          field: "pk",
          composite: ["userId"]
        },
        sk: {
          field: "sk",
          composite: ["sessionToken"]
        }
      },
      bySession:{
        index: "gsi1pk-gsi1sk-index",
        pk: {
            field: "gsi1pk",
            composite: ["sessionToken"]
        },
        sk: {
            field: "gsi1sk",
            composite: ["sessionToken"]
        }
      }
    }
  }, {client, table});

  const Account = new Entity({
    model: {
      service: "USER", 
      entity: "ACCOUNT",
      version: "1"
    },
    attributes:{
      id: {
        type: "string"
      },
      provider: {
        type: "string"
      },
      providerAccountId: {
        type: "string"
      },
      type:{
        type: "string"
      },
      userId: {
        type: "string"
      }
    }, 
    indexes: {
      byAccount: {
        pk: {
          field: "pk",
          composite: ["userId"]
        },
        sk: {
          field: "sk",
          composite: ["provider", "providerAccountId"]
        }
      },
      byProvider: {
        index: "gsi1pk-gsi1sk-index",
        pk: {
            field: "gsi1pk",
            composite: ["provider"]
        },
        sk: {
            field: "gsi1sk",
            composite: ["providerAccountId"]
        }
      }
    }
  }, {client, table});

  const VerificationToken = new Entity({
    model: {
      service: "VT", 
      entity: "VT",
      version: "1"
    },
    attributes:{
      identifier: {
        type: "string"
      },
      token: {
        type: "string"
      },
      type: {
        type: "string"
      }
    }, 
    indexes: {
      byIdentifier: {
        pk: {
          field: "pk",
          composite: ["identifier"]
        },
        sk: {
          field: "sk",
          composite: ["token"]
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
      console.log(user);
      await User.create(user).go();
      console.log("user created ", user);
      return user;
    },

    async getUser(userId) {
      console.log("Inside getUser");
      const data = await User.get({
        id: userId
      }).go();
      return data['data'];
    },
    async getUserByEmail(email){
      console.log("Inside getUser by email");
      let data = await User.find({
        email: email
      }).go();
      data = data['data']
      console.log("read data: ", data);
      if(!data.length) return null;
      return data[0];
    },
    async getUserByAccount({provider, providerAccountId}) {
      console.log("Inside getUserByAccount");
      
      let data = await Account.find({
        provider: provider,
        providerAccountId: providerAccountId
      }).go();
      data = data['data']
      console.log(data);
      if(!data.length) return null;
      const account = data[0];
      const res = await User.get({
        id: account.userId
      }).go();
      if(!res.data.length) return null;
      return res.data[0];
    },
    async updateUser(user){
      console.log("Inside updateUser");
      return await User.update({
        id: user.id
      }).set(...user)
      .go();
    },
    async deleteUser(userId){
      console.log("Inside deleteUser");
      const res = await User.delete({
        id: userId
      }).go();
      await Account.delete({
        id: userId
      }).go();
      await Session.delete({
        id: userId
      }).go()
      return res;
    },
    async linkAccount(data){
      console.log("Inside linkAccount");
      console.log(data);
      const res = await Account.create({
        ...data,
        id: crypto.randomUUID()
      }).go();
      return res['data'];
    },
    async unlinkAccount({provider, providerAccountId}) {
      console.log("Inside unlink Account");
      let data = await Account.find({
        provider: provider,
        providerAccountId: providerAccountId
      }).go();
      data = data['data'];
      const account = data[0];
      await Account.delete({
        userId: account.userId,
        provider: provider,
        providerAccountId: providerAccountId
      }).go();
      return account;
    },
    async getSessionAndUser(sessionToken){
      console.log("Inside getSessionAndUser");
      let data = await Session.find({
        sessionToken: sessionToken
      }).go();
      data = data['data'];
      console.log("received data, ", data);
      if(!data.length) return null;
      const session = data[0];
      session['expires'] = new Date(session['expires']);
      console.log("using session, ", session);
      let user = await User.find({
        id: session.userId
      }).go();
      user = user['data'];
      console.log("received user: ", user);
      if(!user.length) return null;
      user = user[0]
      return { user, session}
    },
    async createSession(data){
      console.log("Inside createSession");
      const session = {
        id: crypto.randomUUID(),
        ...data 
      }
      // replace date

      session['expires'] = session['expires'].toISOString();
      console.log(session);
      await Session.create({
        ...session,
        type: "SESSION"
      }).go();
      session['expires'] = new Date(session['expires']);
      return session; 
    },
    async updateSession(session){
      console.log("Inside updateSession");
      const {sessionToken} = session;
      const data = await Session.find({
        sessionToken: sessionToken
      }).go();
      const {userId} = data[0];
      let newSession = await Session.update({
        userId: userId
      }).set(
        ...session
      ).go();
      return newSession['data'];
    },
    async deleteSession(sessionToken){
      console.log("Inside deleteSession");
      const data = Session.get({
        sessionToken: sessionToken
      }).go();
      if(!data) return null;
      const {userId} = data[0];
      const res=await Session.delete({
        userId: userId
      }).go();
      return res['data'];
    },
    async createVerificationToken(data){
      console.log("Inside createVerificationToken");
      await VerificationToken.create({
        identifier: data.identifier,
        token: data.token,
        type: "VT",
        ...data
      }).go();
      return data;
    },
    async useVerificationToken({identifier, token}){
      console.log("Inside useVerificationToken")
      const data = await VerificationToken.delete({
        identifier: identifier,
        token: token
      }).go();
      return data['data'];
    }
  }
}