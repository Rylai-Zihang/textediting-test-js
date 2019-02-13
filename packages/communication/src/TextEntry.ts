import { DatabaseEntry } from './DatabaseEntry';

export class TextEntry implements DatabaseEntry {

  public constructor(
    public id: number,
    public text: string,
  ) {
  }

  public getIdFieldName(): string {
    return 'id';
  }

  public getId(): number {
    return this.id;
  }
}
