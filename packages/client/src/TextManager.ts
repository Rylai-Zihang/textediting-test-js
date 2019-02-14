import { TextView } from './TextView';
import { WebWorkerMessage, Action } from './WebWorkerMessage';
import { WebWorkerClient } from './WebWorkerClient';

export class TextManager {
  private view: TextView;
  private client: WebWorkerClient = new WebWorkerClient();

  public constructor(view: TextView,
                     host: string,
                     port: number) {
    this.view = view;

    view.subscribeOnTextChangeEvent((text: string) => {
      this.onTextChanged(text);
    });

    this.client.init('updateTextWorker.js', '')
      .then(() => {

        this.client.subscribe((text: string) => {
          // TODO: Do not erase current text on view, but raise an error and disable sending diff.
          //       User have to reload page
          this.view.setText(text);
        });

        const connectMessage: WebWorkerMessage = WebWorkerMessage.createConnectMessage(host, port);
        return this.client.postMessage(connectMessage, Action.ConnectResponse);
      })
      .catch(() => {
        console.error('Failed to start web worker');
      });
  }

  private onTextChanged(newText: string): void {
    this.client.updateText(newText)
      .catch(() => {
        console.error('Failed to send text update');
      });
  }
}
