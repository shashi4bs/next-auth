import { MongoClient } from "mongodb";

let client = new MongoClient(process.env.DB_URL, {});

export default client.connect();