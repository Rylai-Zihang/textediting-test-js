import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as morgan from 'morgan';
import { Express, Request, Response } from 'express-serve-static-core';
import * as path from 'path';
import * as ejs from 'ejs';
import * as http from "http";
import { MongoClient } from 'mongodb';

// tslint:disable-next-line: import-name
import WebSocket = require('ws');

const dbUrl = 'mongodb://localhost:27017';

const app: Express = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.engine('html', ejs.renderFile);
app.use(express.static(path.join(__dirname, '../node_modules/client/dist')));
app.set('views', path.join(__dirname, '../node_modules/client/dist'));

app.get('/chat', (req: Request, res: Response) => {
  res.render('app.html');
});

const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

let currentText = '';

MongoClient.connect(dbUrl, {
  useNewUrlParser: true,
},                  (err, client: MongoClient) => {

  console.log(err);

  const db = client.db('TextDB');
  const collection = db.collection('Text');

  webSocketServer.on('connection', (ws: WebSocket) => {

    ws.on('message', (diff: string) => {

      currentText += diff;

      collection.updateOne({
        id: 1,
      },                   {
        $set: { text : currentText },
      },
                           (err, result) => {
                             webSocketServer.clients.forEach(
                              (client: WebSocket, client2: WebSocket, s: Set<WebSocket>): void => {
                                console.log('Sending: ' + currentText);
                                client.send(currentText);
                              });
                           });

      // ws.send(`Hello, you sent -> ${message}`);
    });

    const cursor = collection.find().toArray((err, texts) => {
      if (texts.length === 0) {
        collection.insertOne({
          id: 1,
          text: '',
        },                   (err, result) => {
          currentText = '';
          console.log('Sending: ' + currentText);
          ws.send(currentText);
        });
        return;
      }

      if (texts.length === 0) {
        currentText = 'error';
      } else {
        currentText = texts[0].text || '';
      }

      console.log('Sending: ' + JSON.stringify(currentText));
      ws.send(currentText);
    });

    // ws.send('Hi there, I am a WebSocket server');
  });

  const port = 3000;
  server.listen(port, () => console.log(`Example app listening on port ${port}!`));
});
