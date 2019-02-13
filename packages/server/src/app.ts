import { WebServer, WebClient } from 'communication';
import { Database } from './Database';
import { TextRepository } from './TextRepository';
import { TextUpdater } from './TextUpdater';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as morgan from 'morgan';
import { Express, Request, Response } from 'express-serve-static-core';
import * as path from 'path';
import * as ejs from 'ejs';
import * as http from 'http';

let textUpdater: TextUpdater = null;

const httpServer: http.Server = setupHttpServer('../node_modules/client/dist');
setupDatabaseConnection()
  .then((db: Database) => {
    const textRepository = new TextRepository(db);
    return setupTextUpdater(textRepository, httpServer);
  })
  .then((updater: TextUpdater) => {
    textUpdater = updater;
    startHttpServer(httpServer);
  })
  .catch((error: Error) => {
    console.error(error.message);
    console.error(error.stack);
  });

function setupHttpServer(hostedClientDir: string): http.Server {
  const app: Express = express();
  app.use(morgan('combined'));
  app.use(bodyParser.json());
  app.use(cors());

  app.engine('html', ejs.renderFile);
  app.use(express.static(path.join(__dirname, hostedClientDir)));
  app.set('views', path.join(__dirname, hostedClientDir));

  app.get('/chat', (req: Request, res: Response) => {
    res.render('app.html');
  });

  return http.createServer(app);
}

function setupDatabaseConnection(): Promise<Database> {
  return Database.connect('localhost');
}

function setupTextUpdater(textRepository: TextRepository,
                          httpServer: http.Server): Promise<TextUpdater> {
  const socketServer: WebServer = new WebServer(httpServer);
  const updater = new TextUpdater(socketServer, textRepository);
  return updater.init()
    .then(() => {
      return updater;
    });
}

function startHttpServer(httpServer: http.Server): void {
  const port = 3000;
  httpServer.listen(port, () => console.log(`Example app listening on port ${port}!`));
}
