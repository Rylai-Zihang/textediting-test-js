const LOCK_FLAG_STEP = 1;

// No threads holding a lock
const ACCESSIBLE = 0;

// Some thread blocked the resource
const BLOCKED = ACCESSIBLE + LOCK_FLAG_STEP;

// Another thread is waiting to be notified when the reource is unblocked
const BLOCKED_WAITING = BLOCKED + LOCK_FLAG_STEP;

/**
 * Copy-pasted logic from https://github.com/lars-t-hansen/js-lock-and-condition
 */
// TODO: Write functional tests
export class SharingLock {

  public constructor(private sharedBufferView: Int32Array, private lockFlagIndex: number) {
    Atomics.store(sharedBufferView, lockFlagIndex, ACCESSIBLE);
  }

  public lock(): void {
    const view = this.sharedBufferView;
    const i = this.lockFlagIndex;

    // If resource is ACCESSIBLE -> block it and leave lock
    let flag = Atomics.compareExchange(view, i, ACCESSIBLE, BLOCKED);
    if (flag === ACCESSIBLE) {
      return;
    }

    do {
      // Ensure that waiting indicator is set
      // However if resource is already accessible - leave the lock
      // after marking it as BLOCKED_WAITING
      if (flag === BLOCKED_WAITING
          || Atomics.compareExchange(view, i, BLOCKED, BLOCKED_WAITING) !== ACCESSIBLE) {

        // Wait while resource is blocked and waiting indicator is set.
        // If waiting indicator is not set we can check if resource is unblocked already.
        Atomics.wait(view, i, BLOCKED_WAITING);
      }

      // If resource is ACCESSIBLE -> mark it as BLOCKED_WAITING and leave lock
      // (it will be made ACCESSIBLE in unlock)
      // Else - take another turn of waiting
      flag = Atomics.compareExchange(view, i, ACCESSIBLE, BLOCKED_WAITING);
    } while (flag !== ACCESSIBLE);
  }

  public async asyncLock(): Promise<void> {
    const view = this.sharedBufferView;
    const i = this.lockFlagIndex;

    // If resource is ACCESSIBLE -> block it and leave lock
    let flag = Atomics.compareExchange(view, i, ACCESSIBLE, BLOCKED);
    if (flag === ACCESSIBLE) {
      return;
    }

    do {
      // Ensure that waiting indicator is set
      // However if resource is already accessible - leave the lock
      // after marking it as BLOCKED_WAITING
      if (flag === BLOCKED_WAITING
          || Atomics.compareExchange(view, i, BLOCKED, BLOCKED_WAITING) !== ACCESSIBLE) {

        // Wait while resource is blocked and waiting indicator is set.
        // If waiting indicator is not set we can check if resource is unblocked already.
        // @ts-ignore
        await Atomics.waitNonblocking(view, i, BLOCKED_WAITING);
      }

      // If resource is ACCESSIBLE -> mark it as BLOCKED_WAITING and leave lock
      // (it will be made ACCESSIBLE in unlock)
      // Else - take another turn of waiting
      flag = Atomics.compareExchange(view, i, ACCESSIBLE, BLOCKED_WAITING);
    } while (flag !== ACCESSIBLE);
  }

  public unlock(): void {
    const view = this.sharedBufferView;
    const i = this.lockFlagIndex;

    const flag = Atomics.sub(view, i, LOCK_FLAG_STEP);
    if (flag === ACCESSIBLE) {
      throw new Error('Invalid lock state: Resource is not blocked');
    }

    if (flag === BLOCKED_WAITING) {
      Atomics.store(view, i, ACCESSIBLE);

      const threadNumberToNotify = 1;
      Atomics.wake(view, i, threadNumberToNotify);
    }
  }
}
