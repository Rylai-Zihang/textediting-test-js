import { TextView } from './TextView';
import { WebWorkerMessage, Action } from './WebWorkerMessage';
import { WebWorkerClient } from './WebWorkerClient';

export class TextManager {

  public static create(view: TextView, host: string, port: number): Promise<TextManager> {

    return WebWorkerClient.create('updateTextWorker.js', '')
      .then((client: WebWorkerClient) => {
        const textManager = new TextManager(view, host, port, client);

        const connectMessage: WebWorkerMessage = WebWorkerMessage.create(Action.Connect,
                                                                         { host, port });
        return client.postMessage(connectMessage, Action.ConnectResponse)
          .then(() => textManager);
      });
  }

  private view: TextView;
  private client: WebWorkerClient;

  private constructor(view: TextView,
                      host: string,
                      port: number,
                      client: WebWorkerClient) {
    this.view = view;
    this.client = client;

    view.subscribeOnTextChangeEvent((text: string) => {
      this.onTextChanged(text);
    });

    this.client.subscribe((text: string) => {
      // TODO: Do not erase current text on view, but raise an error and disable sending diff.
      //       User have to reload page
      this.view.setText(text);
    });
  }

  private onTextChanged(newText: string): void {
    this.client.updateText(newText)
      .catch(() => {
        console.error('Failed to send text update');
      });
  }
}
