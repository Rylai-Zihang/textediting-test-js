import { TextDiffCalculator, TextDiff } from 'diff-calculator';
import { WebWorkerMessage, Action } from './WebWorkerMessage';
import { WebClient } from 'communication';
import { SharedText } from '../utils/SharedText';

let textOnView: SharedText;
let textOnServer: string;
const diffCalculator = new TextDiffCalculator();
let connection: WebClient;

self.addEventListener('message', (event) => {
  const data = event.data;
  if (data instanceof SharedArrayBuffer) {
    textOnView = new SharedText(data);

    const message = WebWorkerMessage.create(Action.WorkerReady);
    postMessage(message);
    return;
  }

  const message = WebWorkerMessage.parse(data);

  switch (message.getAction()) {
    case Action.Connect:
      const data: { host: string, port:number } | null = message.getConnectData();
      const host: string = data ? data.host : '';
      const port: number = data ? data.port : 0;

      WebClient.connect(host, port)
        .then((webClient) => {
          connection = webClient;

          const message = WebWorkerMessage.create(Action.ConnectResponse);
          postMessage(message);
        })
        .then(() => {
          connection.onReceivedMessage((message: any) => {
            onReceivedTextUpdate(message);
          });
        });
      break;
    case Action.OnTextChanged:
      const currentText: string = textOnView.getText();
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
    const currentText = textOnView.getText();
    textOnServer = diffCalculator.apply(currentText, diff);

    textOnView.setText(textOnServer);
  } catch (e) {
    console.error(`Failed to apply diff received from server.
      Error: ${e.message}
      Diff: ${message}`);
  }

  const msg = WebWorkerMessage.create(Action.OnTextReceived);
  postMessage(msg);
}

function postMessage(message: any) {
  const postFunc: any = self.postMessage;
  postFunc(message);
}
