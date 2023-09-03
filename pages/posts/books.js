import { useEffect } from "react"
import { Entity } from 'electrodb';
import aws from "aws-sdk";
import { ElectroDBAdapter } from "../../database/electroDBClient";

// aws.config.loadFromPath('/Users/shashikumar/Projects/next-auth/awsconfig.json')
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }); 

const client = new aws.DynamoDB.DocumentClient({region:"us-east-1"});

const table = "next-auth"
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
      providerId: {
        type: "string"
      },
      providerAccountId: {
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
          composite: ["providerId", "providerAccountId"]
        }
      },
      byProvider: {
        index: "gsi1pk-gsi1sk-index",
        pk: {
            field: "gsi1pk",
            composite: ["providerId"]
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


export default function Books(){
    useEffect(async()=>{
        const user = {
            id: crypto.randomUUID(),
            email: "shashi4bs@gmail.com",
            emailVerified: "false"
        }
        // User.create({
        //     ...user,
        //     type: "USER",
        //     "GSI1PK" : `USER#${user.email}`,
        //     "GSI1SK" : `USER#${user.email}`
        // }).go();
        const user1 = await User.get({
            id: "7d84f905-6f98-4815-88b2-7cb3073434b3"
        }).go();
        console.log(user1);
    }, []);
    return <>
        <h2>This is a book store</h2>
    </>
}