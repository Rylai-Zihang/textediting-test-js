import { HttpServer } from './http/HttpServer';
import { WebSocketServer } from 'communication';
import { TextBroadcaster } from './text-broadcasting/TextBroadcaster';
import { TextBroadcastingClientApp } from './text-broadcasting/TextBroadcastingClientApp';
import { TextRepository } from './text-broadcasting/TextRepository';
import { Database } from './storage/Database';

const LISTENED_HOST = 'localhost';
const LISTENED_PORT = 3000;

// Should be aligned with settings in build scripts
const DATABASE_HOST = 'localhost';
const DATABASE_PORT = 27017;

export class Application {

  private textBroadcaster: TextBroadcaster;

  public run(): Promise<void> {
    return this.connectToDatabase(DATABASE_HOST, DATABASE_PORT)
      .then((database: Database) => {
        return this.doRun(database);
      });
  }

  private doRun(database: Database): Promise<void> {
    const httpServer = new HttpServer(LISTENED_HOST, LISTENED_PORT);

    httpServer.hostClientApplication('/chat', new TextBroadcastingClientApp());

    const webSocketServer: WebSocketServer = httpServer.listenTcpConnectionRequest();

    const textRepository = new TextRepository(database);
    this.textBroadcaster = new TextBroadcaster(textRepository);

    return this.textBroadcaster.initialize()
      .then(() => {
        this.textBroadcaster.connectTo(webSocketServer);

        httpServer.run();
      });
  }

  private connectToDatabase(host: string, port: number): Promise<Database> {
    console.log(`Connecting to a database "${host}:${port}"...`);

    return Database.connect(host, port)
      .then((db: Database) => {
        console.log('Successfully connected to a database');
        return db;
      })
      .catch((e) => {
        throw new Error(`Error while connecting to a database "${host}:${port}": ${e.message}`);
      });
  }
}
