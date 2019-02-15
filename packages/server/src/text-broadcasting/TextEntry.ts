import { DatabaseEntry } from '../storage/DatabaseEntry';

export class TextEntry implements DatabaseEntry {

  public constructor(
    public id: number,
    public text: string,
  ) {
    // In case of huge data text becomes false, should be investigated. Semms it is connected to DB.
    if (typeof text !== 'string') {
      this.text = '';
    }
  }

  public getIdFieldName(): string {
    return 'id';
  }

  public getId(): number {
    return this.id;
  }
}
