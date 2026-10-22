import { type Db, MongoClient } from "mongodb";

export interface Database {
  db: Db;
  close: () => Promise<void>;
  ping: () => Promise<boolean>;
}

export const connectDatabase = async (uri: string): Promise<Database> => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  return {
    db,
    close: () => client.close(),
    ping: () =>
      db
        .command({ ping: 1 })
        .then(() => true)
        .catch(() => false),
  };
};
