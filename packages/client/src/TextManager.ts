import { WebWorkerMessage, Action } from './WebWorkerMessage';
import { WebWorkerClient } from './WebWorkerClient';

type TextChangeCallback = (text: string) => void;

export class TextManager {

  public static create(host: string, port: number): Promise<TextManager> {

    return WebWorkerClient.create('updateTextWorker.js', '')
      .then((client: WebWorkerClient) => {
        const textManager = new TextManager(client);

        const connectMessage: WebWorkerMessage = WebWorkerMessage.create(Action.Connect,
                                                                         { host, port });
        return client.postMessage(connectMessage, Action.ConnectResponse)
          .then(() => textManager);
      });
  }

  private client: WebWorkerClient;
  private textChangeListeners: TextChangeCallback[] = [];

  private constructor(client: WebWorkerClient) {
    this.client = client;

    this.client.subscribe((text: string) => {
      // TODO: Do not erase current text on view, but raise an error and disable sending diff.
      //       User have to reload page
      this.textChangeListeners.forEach((callback: TextChangeCallback) => {
        callback(text);
      });
    });
  }

  public subscribeToTextChanges(callback: TextChangeCallback) {
    this.textChangeListeners.push(callback);
  }

  public onTextChanged(newText: string): void {
    this.client.updateText(newText)
      .catch(() => {
        console.error('Failed to send text update');
      });
  }
}
