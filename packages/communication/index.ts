export class TextWebStoreClient {

  private connection: WebSocket;

  public static connect(storeUrl: string): Promise<TextWebStoreClient> {
    // TODO: Check url correctness
    return new Promise((resolve, reject) => {
      const connection = new WebSocket(`ws://${storeUrl}`);

      connection.onopen = function (evt) {
        const storeClient = new TextWebStoreClient(connection);
        resolve(storeClient);
      };

      // connection.onerror = () => {

      // }
    });
  }

  private constructor(connection: WebSocket) {
    this.connection = connection;
  }

  public subscribeOnTextChangeEvent(textReceivedCallback: (text: string) => void) {
    this.connection.onmessage = function (evt) {
      textReceivedCallback(evt.data);
    };
  }

  public sendDiff(diff: any) {
    this.connection.send(JSON.stringify(diff));
  }
}
