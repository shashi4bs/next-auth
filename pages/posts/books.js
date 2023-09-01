import { useEffect } from "react"
import aws from "aws-sdk";
import { Entity } from 'electrodb';

// aws.config.loadFromPath('/Users/shashikumar/Projects/next-auth/awsconfig.json')
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
}); 

const client = new aws.DynamoDB.DocumentClient({region:"us-east-1"});

// highlight-next-line
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


var params = {
    TableName: 'electro',
    Item: {
      'storeId' : {S: '001'},
      'bookId': {S:'001'},
      'bookName' : {S: 'Richard Roe'}
    }
  };
  
export default function Books(){
    useEffect(()=>{
        Book.create({
            bookId: 'beedabe8-e34e-4d41-9272-0755be9a2a6f',
            storeId: 'pdx-45',
            author: 'Stephen King',
            title: 'IT',
            condition: 'GOOD',
            price: 15,
            genre: ['HORROR', 'THRILLER'],
            published: '1986-09-15',
          }).go();
    }, []);
    return <>
        <h2>This is a book store</h2>
    </>
}