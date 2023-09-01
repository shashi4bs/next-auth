import DynamoDB from "aws-sdk/clients/dynamodb";
import { randomBytes } from "crypto";
import { Entity } from 'electrodb';

const client = new DynamoDB.DocumentClient();

const table = 'electro';

const Book = new Entity({
    model: {
      entity: 'book',
      version: '1',
      service: 'store'
    },
    attributes: {
      storeId: {
        type: 'string',
      },
      bookId: {
        type: 'string',
      },
      price: {
        type: 'number',
        required: true,
      },
      title: {
        type: 'string',
      },
      author: {
        type: 'string',
      },
      condition: {
        type: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'],
        required: true,
      },
      genre: {
        type: 'set',
        items: 'string',
      },
      published: {
        type: 'string',
      }
    },
    indexes: {
      byLocation: {
        pk: {
          // highlight-next-line
          field: 'pk',
          composite: ['storeId']
        },
        sk: {
          // highlight-next-line
          field: 'sk',
          composite: ['bookId']
        }
      },
      byAuthor: {
        // highlight-next-line
        index: 'gsi1pk-gsi1sk-index',
        pk: {
          // highlight-next-line
          field: 'gsi1pk',
          composite: ['author']
        },
        sk: {
          // highlight-next-line
          field: 'gsi1sk',
          composite: ['title']
        }
      }
    }
    // add your DocumentClient and TableName as a second parameter
  }, {client, table});


  export function ElectroDBAdapter(
    client,
    options
  ){
    const TableName = "next-auth"
    //create entity if not exists

    return {
      async createUser(data) {
        const user ={
          ...data,
          id: randomBytes(16).toString("hex")
        }
        await client.put({
          ...user,
          pk: `USER#${user.id}`,
          sk: `USER#${user.id}`,
          type: "USER",
          GSI1PK: `USER#${user.email}`,
          GSI1SK: `USER#${user.email}`,
        }).go();
        return user;
      },

      async getUser(userId) {
        const data = await client.get({
          
        })
      }
    }
}