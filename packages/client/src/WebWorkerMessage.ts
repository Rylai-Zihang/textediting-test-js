export enum Action {
  WorkerReady,

  Connect,
  ConnectResponse,

  OnTextChanged,
  OnTextReceived,
  OnTextChangedResponse,
}

type ConnectData = { host: string, port: number };

export class WebWorkerMessage {

  public static createWorkerReadyMessage() {
    const message = new WebWorkerMessage();
    message.action = Action.WorkerReady;
    return message;
  }

  public static createConnectMessage(host: string, port: number) {
    const message = new WebWorkerMessage();
    message.action = Action.Connect;
    message.connectData = { host, port };
    return message;
  }

  public static createConnectResponseMessage() {
    const message = new WebWorkerMessage();
    message.action = Action.ConnectResponse;
    return message;
  }

  public static createOnTextChangedMessage() {
    const message = new WebWorkerMessage();
    message.action = Action.OnTextChanged;
    return message;
  }

  public static createOnTextChangedResponseMessage() {
    const message = new WebWorkerMessage();
    message.action = Action.OnTextChangedResponse;
    return message;
  }

  public static createOnTextReceivedMessage() {
    const message = new WebWorkerMessage();
    message.action = Action.OnTextReceived;
    return message;
  }

  public static parse(msg: string | Object): WebWorkerMessage {
    WebWorkerMessage.assertParam(msg, 'msg');

    const message = new WebWorkerMessage();

    const messageJson = typeof msg === 'string' ? JSON.parse(msg) : msg;

    const action: Action = WebWorkerMessage.extractAction(messageJson);
    message.action = action;

    switch (action) {
      case Action.Connect:
        message.connectData = WebWorkerMessage.extractConnectData(messageJson);
        break;
    }

    return message;
  }

  // TODO: Code duplication. Extract to some Util class
  private static assertParam(param: any, paramName: string) {
    if (param === null || param === undefined) {
      throw new Error(`${paramName} param has to be non-null and non-undefined`);
    }
  }

  private static extractAction(messageJson: any): Action {
    WebWorkerMessage.assertParam(messageJson, 'messageJson');
    WebWorkerMessage.assertParam(messageJson.action, 'messageJson.action');

    return messageJson.action;
  }

  private static extractConnectData(messageJson: any): any {
    WebWorkerMessage.assertParam(messageJson, 'messageJson');
    WebWorkerMessage.assertParam(messageJson.connectData, 'messageJson.connectData');

    return messageJson.connectData;
  }

  private action: Action;
  private connectData: ConnectData;

  public getAction(): Action {
    return this.action;
  }

  public getConnectData(): ConnectData {
    return this.connectData;
  }

}
