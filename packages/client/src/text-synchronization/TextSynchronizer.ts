import { SharedText } from '../utils/SharedText';
import { WebWorkerCommunicationChannel } from './communication/WebWorkerCommunicationChannel';
import {
  Request,
  Response,
  WorkerReadyEvent,
  WorkerReadyEventResponse,
  SetupMemorySharingRequest,
  ConnectToServerRequest,
  TextReceivedEvent,
  TextReceivedEventResponse,
  TextInputEvent,
} from './communication/requests';

const WORKER_SCRIPT_URI = 'TextSynchronizerWorker.js';
const INITIAL_TEXT = '';

type TextChangeCallback = (text: string) => void;

export class TextSynchronizer {

  public static async create(host: string,
                             port: number,
                             textMaxLength: number): Promise<TextSynchronizer> {
    const sharedBuffer = SharedText.createTextSharedBuffer(textMaxLength);
    const sharedText = new SharedText(sharedBuffer);
    await sharedText.setTextAsync(INITIAL_TEXT);

    const worker = new Worker(WORKER_SCRIPT_URI);
    const workerChannel = new WebWorkerCommunicationChannel(worker);

    return new TextSynchronizer(host, port, workerChannel, sharedBuffer, sharedText);
  }

  private textChangeListeners: TextChangeCallback[] = [];

  // Using shared memory for passing string to WebWorker is useless,
  // cause we still need to copy string to a buffer.
  // However, it shows how to work with it in test task.
  private constructor(private host: string,
                      private port: number,
                      private workerChannel: WebWorkerCommunicationChannel,
                      private sharedBuffer: SharedArrayBuffer,
                      private sharedText: SharedText) {
    this.workerChannel.listen((request: Request<any>): Promise<Response> => {
      switch (request.getType()) {

        case WorkerReadyEvent.getType():
          return this.handleWorkerReadyEvent(request);

        case TextReceivedEvent.getType():
          return this.handleTextReceivedEvent(request);

        default:
          throw new Error(`Unknown request type "${request.getType()}"`);
      }
    });
  }

  public subscribeToTextUpdatesFromServer(callback: TextChangeCallback) {
    this.textChangeListeners.push(callback);
  }

  public async onTextChangedOnClient(text: string): Promise<void> {
    await this.sharedText.setTextAsync(text);

    const textInputEvent = new TextInputEvent();
    this.workerChannel.send(textInputEvent)
      .catch(() => {
        console.error('Failed to send text update');
      });
  }

  private async handleWorkerReadyEvent(request: WorkerReadyEvent)
        : Promise<WorkerReadyEventResponse> {
    const shareMemoryRequest = new SetupMemorySharingRequest(this.sharedBuffer);
    await this.workerChannel.send(shareMemoryRequest);

    const connectRequest = new ConnectToServerRequest(this.host, this.port);
    await this.workerChannel.send(connectRequest);

    return request.createSuccessResponse();
  }

  private async handleTextReceivedEvent(request: TextReceivedEvent)
        : Promise<TextReceivedEventResponse> {
    const text = await this.sharedText.getTextAsync();

    // TODO: Do not erase current text on view, but raise an error and disable sending diff.
    //       User have to reload page
    this.textChangeListeners.forEach((callback: TextChangeCallback) => {
      callback(text);
    });

    return request.createSuccessResponse();
  }
}
