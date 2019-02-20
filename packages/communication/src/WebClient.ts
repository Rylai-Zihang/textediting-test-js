/**
 * Native socket is used for WebClient, but one from 'ws' is used for Server,
 * that's why 'any' is used in some places to reduce type checking,
 * these sockets are competible, so no problems on run time.
 */
export class WebClient {

  private static WEBSOCKET_PROTOCOL = 'ws';

  public static connect(host: string, port: number): Promise<WebClient> {
    return new Promise((resolve, reject) => {
      const url = `${WebClient.WEBSOCKET_PROTOCOL}://${host}:${port}`;
      const connection = new WebSocket(url);
      const connectionTimeout = setTimeout(() => {
        connection.close();
        reject(new Error(`Could not connect to ${url}`));
      },                                   2000);

      connection.onopen = (event: Event) => {
        clearTimeout(connectionTimeout);

        const webClient = new WebClient(connection);
        resolve(webClient);
      };

      connection.onerror = (event: Event) => {
        // TODO: Check how to retrieve error message.
        reject(new Error(`Could not connect to ${url}`));
      };
    });
  }

  public constructor(private connection: any) {

  }

  public send(message: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.connection.onerror = (event: Event) => {
        // TODO: Check how to retrieve error message.
        reject(new Error('Could not send message'));
      };

      this.connection.send(message);
      resolve();
    });
  }

  public onReceivedMessage(receiveCallback: (message: any) => void) {
    this.connection.onmessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') {
        // TODO: Introduce Request & Response(error|result) concepts to communication protocol.
        throw new Error('Message has to be a string');
      }

      receiveCallback(event.data);
    };
  }

  // TODO: Implement ping-pong logic and shutdown connection
  //       if connection with client was silently lot
  public onConnectionLost(callback: () => void): void {
    this.connection.onclose = (event: CloseEvent) => {
      callback();
    };
  }
}
