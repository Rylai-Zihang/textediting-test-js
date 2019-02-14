import { TextDiffCalculator, TextDiff } from 'diff-calculator';
import { WebWorkerMessage, Action } from './WebWorkerMessage';
import { WebClient } from 'communication';
import { SharedArrayBufferUtils } from './SharedArrayBufferUtils';

let sharedBuffer: SharedArrayBuffer;
let textOnView: Uint16Array;
let textOnServer: string;
const diffCalculator = new TextDiffCalculator();
let connection: WebClient;

self.addEventListener('message', (event) => {
  const data = event.data;
  if (data instanceof SharedArrayBuffer) {
    sharedBuffer = data;
    textOnView = new Uint16Array(sharedBuffer);

    const message = WebWorkerMessage.createWorkerReadyMessage();
    postMessage(message);
    return;
  }

  const message = WebWorkerMessage.parse(data);

  switch (message.getAction()) {
    case Action.Connect:
      const host: string = message.getConnectData().host;
      const port: number = message.getConnectData().port;

      WebClient.connect(host, port)
        .then((webClient) => {
          connection = webClient;

          const message = WebWorkerMessage.createConnectResponseMessage();
          postMessage(message);
        })
        .then(() => {
          connection.onReceivedMessage((message: any) => {
            onReceivedTextUpdate(message);
          });
        });
      break;
    case Action.OnTextChanged:
      const currentText: string = SharedArrayBufferUtils.toString(textOnView);
      const diff: TextDiff = diffCalculator.calculate(textOnServer, currentText);

      // TODO: Fail if text version is old one. Discard diff and disable sending.
      const diffStr: string = JSON.stringify(diff);
      connection.send(diffStr);

      textOnServer = currentText;
      break;
  }
});

function onReceivedTextUpdate(message: any): void {
  try {
    const diff: TextDiff = TextDiff.parse(message);
    const currentText = SharedArrayBufferUtils.toString(textOnView);
    textOnServer = diffCalculator.apply(currentText, diff);

    SharedArrayBufferUtils.stringToArray(textOnServer, textOnView);
  } catch (e) {
    console.error(`Failed to apply diff received from server.
      Error: ${e.message}
      Diff: ${message}`);
  }

  const msg = WebWorkerMessage.createOnTextReceivedMessage();
  postMessage(msg);
}

function postMessage(message: any) {
  const postFunc: any = self.postMessage;
  postFunc(message);
}
