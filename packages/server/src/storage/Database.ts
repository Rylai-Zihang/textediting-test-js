import { DatabaseEntry } from './DatabaseEntry';

import {
  MongoClient,
  Db,
  MongoError,
  InsertOneWriteOpResult,
  UpdateWriteOpResult,
} from 'mongodb';

export class Database {

  private static DATABASE_PROTOCOL = 'mongodb';
  private static DATABASE_NAME = 'TextDB';

  public static connect(host: string, port: number = 27017): Promise<Database> {
    const url = `${this.DATABASE_PROTOCOL}://${host}:${port}`;
    return this.connectToDB(url)
      .then((client: MongoClient): Database => {
        return new Database(client);
      });
  }

  private static connectToDB(url: string): Promise<MongoClient> {
    return new Promise<MongoClient>((resolve, reject) => {
      MongoClient.connect(url, {
        useNewUrlParser: true,
      },                  (err: Error, client: MongoClient) => {
        if (err) {
          reject(err);
        } else {
          resolve(client);
        }
      });
    });
  }

  private db: Db;

  private constructor(private dbClient: MongoClient) {
    this.db = dbClient.db(Database.DATABASE_NAME);
  }

  public getCollection<T>(collectionName: string): Promise<T[]>  {
    return this.db
      .collection<T>(collectionName)
      .find()
      .toArray();
  }

  public insertOne<T>(obj: T, collectionName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      return this.db
        .collection<T>(collectionName)
        .insertOne(obj, {}, (error: MongoError, result: InsertOneWriteOpResult): void => {
          if (error) {
            reject(new Error(error.message));
          } else {
            resolve();
          }
        });
    });
  }

  public updateOne(obj: DatabaseEntry, collectionName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const idFieldName = obj.getIdFieldName();
      const id = obj.getId();
      const objFilter = { [idFieldName]: id };
      const objSet = { $set: obj };

      return this.db
        .collection(collectionName)
        .updateOne(objFilter,
                   objSet,
                   (error: MongoError, result: UpdateWriteOpResult): void => {
                     if (error) {
                       reject(new Error(error.message));
                     } else {
                       resolve();
                     }
                   });
    });

  }
}
