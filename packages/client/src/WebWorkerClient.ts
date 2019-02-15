
import { WebWorkerMessage, Action } from './WebWorkerMessage';
import { SharedArrayBufferUtils } from './SharedArrayBufferUtils';

export class WebWorkerClient {

  public static create(scriptName: string, initialText: string): Promise<WebWorkerClient> {
    const client = new WebWorkerClient(scriptName, initialText);

    return client.post(client.sharedBuffer, Action.WorkerReady)
    .then(() => {
      return client;
    });
  }

  private worker: Worker;
  private sharedBuffer: SharedArrayBuffer;
  private sharedArray: Uint16Array;

  private constructor(scriptName: string, initialText: string) {
    this.sharedBuffer = new SharedArrayBuffer(3000000);
    this.sharedArray = new Uint16Array(this.sharedBuffer);
    SharedArrayBufferUtils.stringToArray(initialText, this.sharedArray);

    this.worker = new Worker(scriptName);
  }

  public postMessage(message: WebWorkerMessage, responseAction: Action): Promise<void> {
    return this.post(message, responseAction);
  }

  public subscribe(textUpdateCallback: (text: string) => void) {
    this.worker.addEventListener('message', (event) => {
      const data = event.data;
      const message = WebWorkerMessage.parse(data);

      if (message.getAction() === Action.OnTextReceived) {

        const currentText = SharedArrayBufferUtils.toString(this.sharedArray);
        textUpdateCallback(currentText);
      }
    });
  }

  public updateText(text: string): Promise<void> {
    SharedArrayBufferUtils.stringToArray(text, this.sharedArray);

    const message = WebWorkerMessage.create(Action.OnTextChanged);
    return this.post(message, Action.OnTextChangedResponse);
  }

  private post(message: any, responseAction: Action): Promise <void> {
    return new Promise<void>((resolve, reject) => {
      this.worker.postMessage(message);

      const onMessageCallback = (event: any) => {
        this.worker.removeEventListener('message', onMessageCallback);
        this.worker.removeEventListener('error', onErrorCallback);

        const data = event.data;
        const message = WebWorkerMessage.parse(data);

        switch (message.getAction()) {
          case responseAction:
            resolve();
          default:
            reject(new Error('Incorrect message sent back for a connection requirest'));
        }
      };

      const onErrorCallback = (error: ErrorEvent) => {
        this.worker.removeEventListener('message', onMessageCallback);
        this.worker.removeEventListener('error', onErrorCallback);

        reject(error.error);
      };

      this.worker.addEventListener('message', onMessageCallback);
      this.worker.addEventListener('error', onErrorCallback);
    });
  }
}
