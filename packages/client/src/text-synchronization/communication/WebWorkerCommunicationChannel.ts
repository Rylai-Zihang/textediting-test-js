import { Request, Response, parseRequest, isRequest } from './requests';

export class WebWorkerCommunicationChannel {

  public constructor(private context: Worker | Window) {
  }

  public async send<Req extends Request<Res>, Res extends Response>(request: Req): Promise<Res> {
    return new Promise<Res>((resolve, reject) => {
      const onMessageCallback = (event: any) => {

        // This callback handles only message which is a response to the sent request
        if (!request.isCorrectResponse(event.data)) {
          return;
        }

        this.context.removeEventListener('message', onMessageCallback);
        this.context.removeEventListener('error', onErrorCallback);

        const response: Res = request.parseResponse(event.data);
        resolve(response);
      };

      const onErrorCallback = (evt: Event) => {
        this.context.removeEventListener('message', onMessageCallback);
        this.context.removeEventListener('error', onErrorCallback);

        reject(new Error('Error occured while sending request'));
      };

      this.context.addEventListener('message', onMessageCallback);
      this.context.addEventListener('error', onErrorCallback);

      this.postMessage(request);
    });
  }

  public listen(callback: (request: Request<any>) => Promise<Response>): void {
    this.context.addEventListener('message', async (event: any) => {

      // This callback handles only message which is an any request from other side
      if (!isRequest(event.data)) {
        return;
      }

      const request = parseRequest(event.data);
      try {
        const response = await callback(request);
        this.postMessage(response);
      } catch (e) {
        console.error(`Error while handling request '${request.getType()}': ${e.message}`);
        // TODO: Handle errors
        // this.postMessage(createErrorResponse(requestId, message));
      }
    });
  }

  // Needed to make general interface for different types of a context
  private postMessage(message: any): void {
    const postFunc: any = this.context.postMessage.bind(this.context);
    postFunc(message);
  }

}
