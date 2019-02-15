import { WebSocketServer } from 'communication';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as morgan from 'morgan';
import { Express, Request, Response } from 'express-serve-static-core';
import * as ejs from 'ejs';
import * as http from 'http';

export class HttpServer {

  private expressApp: Express;
  private httpServer: http.Server;
  private tcpConnection: WebSocketServer = null;

  private host: string;
  private port: number;

  constructor(host: string, port: number) {
    this.expressApp = this.setupExpressApplication();
    this.httpServer = http.createServer(this.expressApp);

    this.host = host;
    this.port = port;
  }

  public hostClientApplication(
      listenedUri: string,
      appDirectory: string,
      appEntryPoint: string): void {

    this.expressApp.use(express.static(appDirectory));
    this.expressApp.set('views', appDirectory);

    this.expressApp.get(listenedUri, (req: Request, res: Response) => {
      res.render(appEntryPoint);
    });
  }

  public listenTcpConnectionRequest(): WebSocketServer {
    if (!this.tcpConnection) {
      this.tcpConnection = new WebSocketServer(this.httpServer);
    }

    return this.tcpConnection;
  }

  public run(): void {
    this.httpServer.listen(this.port, this.host, () => {
      console.log(`Started listening on "${this.host}:${this.port}"`);
    });

    this.httpServer.on('error', (error: Error) => {
      console.error('Error occured in HTTP Server while listening '
          + `"${this.host}:${this.port}": ${error.message}`);
    });
  }

  private setupExpressApplication(): Express {
    const expressApp: Express = express();

    expressApp.use(morgan('combined'));
    expressApp.use(bodyParser.json());
    expressApp.use(cors());

    expressApp.engine('html', ejs.renderFile);

    return expressApp;
  }

}
