import { TextDiffAddEntry } from './TextDiffAddEntry';
import { TextDiffRemoveEntry } from './TextDiffRemoveEntry';

export class TextDiff {

  public constructor(private addedChanges: TextDiffAddEntry[],
                     private removedChanges: TextDiffRemoveEntry[]) {}
}
