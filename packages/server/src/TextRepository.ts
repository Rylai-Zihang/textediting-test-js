
import { Database } from './Database';
import { TextEntry } from 'communication';

export class TextRepository {

  private static TEXT_COLLECTION_NAME: string = 'Text';

  private static DEFAULT_TEXT_ID: number = 1;
  private static DEFAULT_TEXT_VALUE: string = '';
  private static DEFAULT_TEXT_ENTRY: TextEntry = new TextEntry(
    TextRepository.DEFAULT_TEXT_ID, TextRepository.DEFAULT_TEXT_VALUE);

  public constructor(private db: Database) {
  }

  public getText(): Promise<TextEntry | null> {
    return this.db.getCollection<TextEntry>(TextRepository.TEXT_COLLECTION_NAME)
      .then((collection: TextEntry[]) => {
        if (collection.length > 1) {
          throw new Error('Database should contain sigle TextEntry item');
        }

        if (collection.length === 0) {
          return null;
        }

        return new TextEntry(collection[0].id, collection[0].text || '');
      });
  }

  public initText(): Promise<void> {
    return this.getText()
      .then((text: TextEntry | null) => {
        if (text) {
          throw new Error('Text entry already exists');
        }
      })
      .then(() => {
        return this.db.insertOne(
          TextRepository.DEFAULT_TEXT_ENTRY,
          TextRepository.TEXT_COLLECTION_NAME,
        );
      });
  }

  public updateText(textEntry: TextEntry): Promise<void> {
    return this.db.updateOne(textEntry, TextRepository.TEXT_COLLECTION_NAME);
  }
}
