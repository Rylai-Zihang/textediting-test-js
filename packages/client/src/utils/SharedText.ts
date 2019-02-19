import { SharingLock } from './SharingLock';

const TEXT_SHIFT = 2;

// sharedArray[0] - thread synchronizations flag
const TEXT_LOCK_FLAG_INDEX = 0;

// sharedArray[1] - text length
const TEXT_LENGTH_FLAG_INDEX = 1;

// TODO: Write functional tests
export class SharedText {

  private sharedBufferInt32View: Int32Array;
  private lock: any;

  constructor(sharedBuffer: SharedArrayBuffer) {
    this.sharedBufferInt32View = new Int32Array(sharedBuffer);
    this.lock = new SharingLock(this.sharedBufferInt32View, TEXT_LOCK_FLAG_INDEX);
  }

  public getText(): string {
    this.lock.lock();

    const text = this.getTextUnsafe();

    this.lock.unlock();

    return text;
  }

  public async getTextAsync(): Promise<string> {
    await this.lock.asyncLock();

    const text = this.getTextUnsafe();

    this.lock.unlock();

    return text;
  }

  public setText(text: string): void {
    this.lock.lock();

    this.setTextUnsafe(text);

    this.lock.unlock();
  }

  public async setTextAsync(text: string): Promise<void> {
    await this.lock.asyncLock();

    this.setTextUnsafe(text);

    this.lock.unlock();
  }

  private getTextUnsafe(): string {
    const length: number = this.sharedBufferInt32View[TEXT_LENGTH_FLAG_INDEX];

    const strArr = [];
    for (let i = 0; i < length; i += 1) {
      const code = this.sharedBufferInt32View[i + TEXT_SHIFT];
      strArr[i] = String.fromCharCode(code);
    }

    return strArr.join('');
  }

  private setTextUnsafe(text: string): void {
    const length = this.toInt32(text.length);

    this.sharedBufferInt32View[TEXT_LENGTH_FLAG_INDEX] = length;

    for (let i = 0; i < length; i += 1) {
      this.sharedBufferInt32View[i + TEXT_SHIFT] = text.charCodeAt(i);
    }
  }

  private toInt32(n: number): number {
    return n >> 0;
  }
}
