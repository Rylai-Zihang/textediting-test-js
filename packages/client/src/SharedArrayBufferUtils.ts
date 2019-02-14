export class SharedArrayBufferUtils {

  public static toString(array: Uint16Array) {
    const length: number = array[0];

    const strArr = [];
    for (let i = 0; i < length; i += 1) {
      const code = Atomics.load(array, i + 1);
      strArr[i] = String.fromCharCode(code);
    }
    return strArr.join('');
  }

  public static stringToArray(str: string, array: Uint16Array) {
    const length = this.uint16(str.length);

    // array[0] = length;
    Atomics.store(array, 0, length);

    // 2 bytes for each char
    for (let i = 0, strLen = str.length; i < strLen; i += 1) {
      // array[i + 1] = str.charCodeAt(i);
      Atomics.store(array, i + 1, str.charCodeAt(i));
    }
  }

  private static uint16 (n: number) {
    return n & 0xFFFF;
  }
}
