
export class Request<Res extends Response> {

  private id: number;
  private type: string;

  constructor(type: string) {
    this.id = this.generateId();
    this.type = type;
  }

  public getId(): number {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getType(): string {
    return this.type;
  }

  public createSuccessResponse(): Res {
    throw new Error('Has to be implemented in child classes');
  }

  public createErrorResponse(errorMessage: string): Res {
    throw new Error('Has to be implemented in child classes');
  }

  public parseResponse(obj: any): Res {
    if (!this.isCorrectResponse(obj)) {
      throw new Error('Response has different id than request');
    }

    return !!obj.errorMessage
        ? this.createErrorResponse(obj.errorMessage)
        : this.createSuccessResponse();
  }

  public isCorrectResponse(obj: any): boolean {
    return obj.requestId && obj.requestId === this.getId();
  }

  private generateId(): number {
    const maxValue = 9999;
    return Math.floor(Math.random() * Math.floor(maxValue));
  }
}
export class Response {
  public constructor(private requestId: number, private errorMessage: string = '') {}
}

/**
 * WorkerReadyEvent
 */

export class WorkerReadyEvent extends Request<WorkerReadyEventResponse> {

  public static getType(): string { return 'WorkerReadyEvent'; }
  public static parse(obj: any): WorkerReadyEvent {
    return new WorkerReadyEvent();
  }

  public constructor() {
    super(WorkerReadyEvent.getType());
  }

  public createSuccessResponse(): WorkerReadyEventResponse {
    return new WorkerReadyEventResponse(this.getId());
  }

  public createErrorResponse(errorMessage: string): WorkerReadyEventResponse {
    return new WorkerReadyEventResponse(this.getId(), errorMessage);
  }
}
export class WorkerReadyEventResponse extends Response {
  public constructor(requestId: number, errorMessage: string = '') {
    super(requestId, errorMessage);
  }
}

/**
 * SetupMemorySharingRequest
 */

export class SetupMemorySharingRequest extends Request<SetupMemorySharingResponse> {

  public static getType(): string { return 'SetupMemorySharingRequest'; }
  public static parse(obj: any): SetupMemorySharingRequest {
    if (!obj.sharedMemory) {
      throw new Error('"SetupMemorySharingRequest" has to contain "sharedMemory" property');
    }

    return new SetupMemorySharingRequest(obj.sharedMemory);
  }

  public constructor(private sharedMemory: SharedArrayBuffer) {
    super(SetupMemorySharingRequest.getType());
  }

  public getSharedMemory(): SharedArrayBuffer {
    return this.sharedMemory;
  }

  public createSuccessResponse(): SetupMemorySharingResponse {
    return new SetupMemorySharingResponse(this.getId());
  }

  public createErrorResponse(errorMessage: string): SetupMemorySharingResponse {
    return new SetupMemorySharingResponse(this.getId(), errorMessage);
  }
}
export class SetupMemorySharingResponse extends Response {
  public constructor(requestId: number, errorMessage: string = '') {
    super(requestId, errorMessage);
  }
}

/**
 * ConnectToServerRequest
 */

export class ConnectToServerRequest extends Request<ConnectToServerResponse> {

  public static getType(): string { return 'ConnectToServerRequest'; }
  public static parse(obj: any): ConnectToServerRequest {
    if (!obj.host || !obj.port) {
      throw new Error('"ConnectToServerRequest" has to contain "host" and "port" properties');
    }

    return new ConnectToServerRequest(obj.host, obj.port);
  }

  public constructor(private host: string, private port: number) {
    super(ConnectToServerRequest.getType());
  }

  public getHost(): string {
    return this.host;
  }

  public getPort(): number {
    return this.port;
  }

  public createSuccessResponse(): ConnectToServerResponse {
    return new ConnectToServerResponse(this.getId());
  }

  public createErrorResponse(errorMessage: string): ConnectToServerResponse {
    return new ConnectToServerResponse(this.getId(), errorMessage);
  }
}
export class ConnectToServerResponse extends Response {
  public constructor(requestId: number, errorMessage: string = '') {
    super(requestId, errorMessage);
  }
}

/**
 * TextReceivedEvent
 */

export class TextReceivedEvent extends Request<TextReceivedEventResponse> {

  public static getType(): string { return 'TextReceivedEvent'; }
  public static parse(obj: any): TextReceivedEvent {
    return new TextReceivedEvent();
  }

  public constructor() {
    super(TextReceivedEvent.getType());
  }

  public createSuccessResponse(): TextReceivedEventResponse {
    return new TextReceivedEventResponse(this.getId());
  }

  public createErrorResponse(errorMessage: string): TextReceivedEventResponse {
    return new TextReceivedEventResponse(this.getId(), errorMessage);
  }
}
export class TextReceivedEventResponse extends Response {
  public constructor(requestId: number, errorMessage: string = '') {
    super(requestId, errorMessage);
  }
}

/**
 * TextInputEvent
 */

export class TextInputEvent extends Request<TextInputEventResponse> {

  public static getType(): string { return 'TextInputEvent'; }
  public static parse(obj: any): TextInputEvent {
    return new TextInputEvent();
  }

  public constructor() {
    super(TextInputEvent.getType());
  }

  public createSuccessResponse(): TextInputEventResponse {
    return new TextInputEventResponse(this.getId());
  }

  public createErrorResponse(errorMessage: string): TextInputEventResponse {
    return new TextInputEventResponse(this.getId(), errorMessage);
  }
}
export class TextInputEventResponse extends Response {
  public constructor(requestId: number, errorMessage: string = '') {
    super(requestId, errorMessage);
  }
}

/**
 * requestFactories
 */

const requestFactories = {
  [WorkerReadyEvent.getType()]: WorkerReadyEvent.parse,
  [SetupMemorySharingRequest.getType()]: SetupMemorySharingRequest.parse,
  [ConnectToServerRequest.getType()]: ConnectToServerRequest.parse,
  [TextReceivedEvent.getType()]: TextReceivedEvent.parse,
  [TextInputEvent.getType()]: TextInputEvent.parse,
};

export function parseRequest(obj: any): Request<any> {
  if (!obj.type) {
    throw new Error('Request row object does not contain "type" parameter');
  }

  const factoryFunc = requestFactories[obj.type];
  if (!factoryFunc) {
    throw new Error(`Couldn't find factory for request type "${obj.type}"`);
  }

  const request: Request<any> = factoryFunc(obj);
  request.setId(obj.id);
  return request;
}

export function isRequest(obj: any): boolean {
  if (!obj.type || !obj.id) {
    return false;
  }

  return !!requestFactories[obj.type];
}
