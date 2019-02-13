import { TextDiff } from './TextDiff';

import { createPatch, applyPatch } from 'diff';

export type CreatePatchFunc = (fileName: string, oldStr: string, newStr: string) => string;
export type ApplyPatchFunc = (str: string, patch: string) => string;

export class TextDiffCalculator {

  /**
   * TextDiffCalculator uses 'diff' module by default to create/apply patches for 2 strings,
   * however it allows to inject different implementations, so it can be tested by unit tests.
   *
   * @param createPatchFunc Creates diff between 2 strings
   * @param applyPatchFunc Applies diff as a patch to a string
   */
  public constructor(
    private createPatchFunc: CreatePatchFunc = createPatch,
    private applyPatchFunc: ApplyPatchFunc = applyPatch,
  ) {
  }

  public calculate(oldText: string, newText: string): TextDiff {
    this.assertParam(oldText, 'oldText');
    this.assertParam(newText, 'newText');

    const patch: string = this.createPatchFunc('text', oldText, newText);
    return new TextDiff(patch);
  }

  public apply(text: string, diff: TextDiff): string {
    this.assertParam(text, 'text');
    this.assertParam(diff, 'diff');

    return this.applyPatchFunc(text, diff.getPatch());
  }

  // TODO: Code duplication. Extract to some Util class
  private assertParam(param: any, paramName: string) {
    if (param === null || param === undefined) {
      throw new Error(`${paramName} param has to be non-null and non-undefined`);
    }
  }
}
