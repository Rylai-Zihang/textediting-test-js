import { WebClient } from './WebClient';

import * as http from 'http';
import * as WebSocket from 'ws';

/**
 * Web Socket Server is only available on Node JS(back-end) side
 * It creates WebSocket from 'ws' module for each connection.
 * However native socket is used for WebClient, that's why 'any' is used in some
 * places to reduce type checking, these sockets are competible, so no problems on run time.
 */
export class WebSocketServer {

  private webSocketServer: WebSocket.Server;
  private connections: WebClient[] = [];

  constructor(private httpServer: http.Server) {
    this.webSocketServer = new WebSocket.Server({
      server: httpServer,
    });
  }

  public onConnectionAcquired(connectionCallback: (connection: WebClient) => void): void {
    this.webSocketServer.on('connection', (ws: WebSocket): void => {
      const connection = new WebClient(ws);
      this.connections.push(connection);
      connectionCallback(connection);
    });

    // Ignoring socket server errors for now.
    // Possible errors have to be investigated to have proper handling.
    this.webSocketServer.on('error', (ws: WebSocket, error: Error): void => {
      console.error(`Error occured in connection with "${ws.url}": ${error.message}`);
    });
  }
}
