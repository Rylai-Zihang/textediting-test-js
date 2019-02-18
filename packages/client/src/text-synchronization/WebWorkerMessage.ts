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

  public static create(action: Action, connectData: ConnectData | null = null): WebWorkerMessage {
    return new WebWorkerMessage(action, connectData);
  }

  public static parse(msg: string | Object): WebWorkerMessage {
    WebWorkerMessage.assertParam(msg, 'msg');

    const messageJson = typeof msg === 'string' ? JSON.parse(msg) : msg;

    const action: Action = WebWorkerMessage.extractAction(messageJson);
    switch (action) {
      case Action.Connect:
        const connectData = WebWorkerMessage.extractConnectData(messageJson);
        return new WebWorkerMessage(action, connectData);
    }

    return new WebWorkerMessage(action);
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

  private constructor(private action: Action, private connectData: ConnectData | null = null) {
  }

  public getAction(): Action {
    return this.action;
  }

  public getConnectData(): ConnectData | null {
    return this.connectData;
  }

}
