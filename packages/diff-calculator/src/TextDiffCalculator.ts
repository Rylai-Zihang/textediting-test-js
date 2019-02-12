import { TextDiffAddEntry } from './TextDiffAddEntry';
import { TextDiffRemoveEntry } from './TextDiffRemoveEntry';
import { TextDiff } from './TextDiff';

import { Diff, Change } from 'diff';

enum ChangeType { Added, Removed }

export class TextDiffCalculator {

  public calculate(text: string, newText: string): TextDiff {
    const diff = new Diff();
    const changes: Change[] = diff.diff(text, newText);

    const added: TextDiffAddEntry[] = this.extractAddChanges(changes);
    const removed: TextDiffRemoveEntry[] = this.extractRemoveChanges(changes);
    return new TextDiff(added, removed);
  }

  private extractAddChanges(changes: Change[]): TextDiffAddEntry[] {
    const entries: TextDiffAddEntry[] = [];

    this.iterateChanges(changes, ChangeType.Added, (index: number, value: string) => {
      const entry: TextDiffAddEntry = new TextDiffAddEntry(index, value);
      entries.push(entry);
    });

    return entries;
  }

  private extractRemoveChanges(changes: Change[]): TextDiffRemoveEntry[] {
    const entries: TextDiffRemoveEntry[] = [];

    this.iterateChanges(changes, ChangeType.Removed, (index: number, value: string) => {
      const entry: TextDiffRemoveEntry = new TextDiffRemoveEntry(index, value.length);
      entries.push(entry);
    });

    return entries;
  }

  private iterateChanges(changes: Change[],
                         type: ChangeType,
                         nextEntryFunc: (index: number, value: string) => void): void {
    let index = 0;
    for (const change of changes) {
      let skipToNext: boolean = (type === ChangeType.Added && !change.added);
      skipToNext = skipToNext || (type === ChangeType.Removed && !change.removed);

      if (skipToNext) {
        index += change.count || 0;
        continue;
      }

      nextEntryFunc(index, change.value);
    }
  }
}
