import { WebWorkerMessage, Action } from './WebWorkerMessage';
import { SharedText } from '../utils/SharedText';

const WORKER_SCRIPT_URI = 'TextSynchronizerWorker.js';
const INITIAL_TEXT = '';

type TextChangeCallback = (text: string) => void;

export class TextSynchronizer {

  public static async create(host: string,
                             port: number,
                             textMaxLength: number): Promise<TextSynchronizer> {

    const synchronizer = new TextSynchronizer(WORKER_SCRIPT_URI, textMaxLength);
    await synchronizer.sharedText.setText(INITIAL_TEXT);
    await synchronizer.setupConnectionWith(host, port);
    return synchronizer;
  }

  private worker: Worker;
  private textChangeListeners: TextChangeCallback[] = [];

  // Using shared memory for passing string to WebWorker is useless,
  // cause we still need to copy string to a buffer.
  // However, it shows how to work with it in test task.
  private sharedBuffer: SharedArrayBuffer;
  private sharedText: SharedText;

  private constructor(scriptName: string, textMaxLength: number) {
    this.worker = new Worker(scriptName);

    // TODO: Track text length and ignore symbols over this limit.
    this.sharedBuffer = new SharedArrayBuffer(textMaxLength);
    this.sharedText = new SharedText(this.sharedBuffer);

    this.worker.addEventListener('message', async (event) => {
      const data = event.data;
      const message = WebWorkerMessage.parse(data);

      if (message.getAction() === Action.OnTextReceived) {
        const text = await this.sharedText.getTextAsync();

      // TODO: Do not erase current text on view, but raise an error and disable sending diff.
      //       User have to reload page
        this.textChangeListeners.forEach((callback: TextChangeCallback) => {
          callback(text);
        });
      }
    });
  }

  public subscribeToTextUpdatesFromServer(callback: TextChangeCallback) {
    this.textChangeListeners.push(callback);
  }

  public async onTextChangedOnClient(text: string): Promise<void> {
    await this.sharedText.setTextAsync(text);

    const message = WebWorkerMessage.create(Action.OnTextChanged);
    this.post(message, Action.OnTextChangedResponse)
      .catch(() => {
        console.error('Failed to send text update');
      });
  }

  private setupConnectionWith(host: string, port: number): Promise<void> {
    return this.post(this.sharedBuffer, Action.WorkerReady)
      .then(() => {
        const connectMessage: WebWorkerMessage = WebWorkerMessage.create(
          Action.Connect, { host, port },
        );
        this.post(connectMessage, Action.ConnectResponse);
      });
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
