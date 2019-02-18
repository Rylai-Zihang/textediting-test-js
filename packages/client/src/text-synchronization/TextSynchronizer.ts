import { WebWorkerMessage, Action } from './WebWorkerMessage';
import { SharedArrayBufferUtils } from '../utils/SharedArrayBufferUtils';

const WORKER_SCRIPT_URI = 'TextSynchronizerWorker.js';
const INITIAL_TEXT = '';

type TextChangeCallback = (text: string) => void;

export class TextSynchronizer {

  public static create(host: string,
                       port: number,
                       textMaxLength: number): Promise<TextSynchronizer> {

    const synchronizer = new TextSynchronizer(WORKER_SCRIPT_URI, INITIAL_TEXT, textMaxLength);
    return synchronizer.setupConnectionWith(host, port)
      .then(() => synchronizer);
  }

  private worker: Worker;
  private textChangeListeners: TextChangeCallback[] = [];
  private sharedBuffer: SharedArrayBuffer;
  private sharedArray: Uint16Array;

  private constructor(scriptName: string, initialText: string, textMaxLength: number) {
    this.worker = new Worker(scriptName);

    // TODO: Track text length and ignore symbols over this limit.
    this.sharedBuffer = new SharedArrayBuffer(textMaxLength);
    this.sharedArray = new Uint16Array(this.sharedBuffer);
    SharedArrayBufferUtils.stringToArray(initialText, this.sharedArray);

    this.worker.addEventListener('message', (event) => {
      const data = event.data;
      const message = WebWorkerMessage.parse(data);

      if (message.getAction() === Action.OnTextReceived) {
        const text = SharedArrayBufferUtils.toString(this.sharedArray);

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

  public onTextChangedOnClient(text: string): void {
    SharedArrayBufferUtils.stringToArray(text, this.sharedArray);

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
