import { WebWorkerCommunicationChannel } from './communication/WebWorkerCommunicationChannel';
import {
  Request,
  Response,
  WorkerReadyEvent,
  SetupMemorySharingRequest,
  SetupMemorySharingResponse,
  ConnectToServerRequest,
  ConnectToServerResponse,
  TextReceivedEvent,
  TextInputEvent,
  TextInputEventResponse,
} from './communication/requests';
import { SharedText } from '../utils/SharedText';
import { WebClient } from 'communication';
import { TextDiff, TextDiffCalculator } from 'diff-calculator';

class TextSynchronizerWorker {

  public static async create(context: Window): Promise<TextSynchronizerWorker> {
    const workerChannel = new WebWorkerCommunicationChannel(context);
    const synchronizerWorker = new TextSynchronizerWorker(workerChannel);

    const readyEvent = new WorkerReadyEvent();
    await workerChannel.send(readyEvent);

    return synchronizerWorker;
  }

  private connection?: WebClient;
  private sharedText?: SharedText;
  private textOnServer: string = '';

  public constructor(private workerChannel: WebWorkerCommunicationChannel) {
    this.workerChannel.listen((request: Request<any>): Promise<Response> => {
      switch (request.getType()) {

        case SetupMemorySharingRequest.getType():
          return this.handleSetupMemorySharingRequest(<SetupMemorySharingRequest> request);

        case ConnectToServerRequest.getType():
          return this.handleConnectToServerRequest(<ConnectToServerRequest> request);

        case TextInputEvent.getType():
          return this.handleTextInputEvent(request);

        default:
          throw new Error(`Unknown request type "${request.getType()}"`);
      }
    });
  }

  private async handleSetupMemorySharingRequest(request: SetupMemorySharingRequest)
      : Promise<SetupMemorySharingResponse> {
    this.sharedText = new SharedText(request.getSharedMemory());

    return request.createSuccessResponse();
  }

  private async handleConnectToServerRequest(request: ConnectToServerRequest)
      : Promise<ConnectToServerResponse> {
    return WebClient.connect(request.getHost(), request.getPort())
        .then((webClient) => {
          this.connection = webClient;

          webClient.onReceivedMessage((message: any) => {
            this.onReceivedTextUpdate(message);
          });

          return request.createSuccessResponse();
        });
  }

  private async onReceivedTextUpdate(message: any): Promise<void> {
    if (!this.sharedText) {
      throw new Error('Invalid worker state: No memory was shared with main thread');
    }

    try {
      const diff: TextDiff = TextDiff.parse(message);
      const currentText = this.sharedText.getText();

      const diffCalculator = new TextDiffCalculator();
      this.textOnServer = diffCalculator.apply(currentText, diff);

      this.sharedText.setText(this.textOnServer);

      const textReceivedEvent = new TextReceivedEvent();
      await this.workerChannel.send(textReceivedEvent);
    } catch (e) {
      console.error(`Failed to apply diff received from server.
      Error: ${e.message}
      Diff: ${message}`);
    }
  }

  private async handleTextInputEvent(request: TextInputEvent)
      : Promise<TextInputEventResponse> {
    if (!this.sharedText) {
      throw new Error('Invalid worker state: No memory was shared with main thread');
    }
    if (!this.connection) {
      throw new Error('Invalid worker state: Connection with server was not setup');
    }

    const currentText: string = this.sharedText.getText();

    const diffCalculator = new TextDiffCalculator();
    const diff: TextDiff = diffCalculator.calculate(this.textOnServer, currentText);

    // TODO: Fail if text version is old one. Discard diff and disable sending.
    const diffStr: string = JSON.stringify(diff);
    this.connection.send(diffStr);

    this.textOnServer = currentText;
    return request.createSuccessResponse();
  }
}

// TODO: Move worker initialization to separate file
TextSynchronizerWorker.create(self)
  .catch((e: Error) => {
    console.error(`Failed to start TextSynchronizerWorker: ${e.message}`);
  });
