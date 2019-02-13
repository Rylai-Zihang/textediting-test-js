import { createPatch, applyPatch } from 'diff';

export class TextDiff {

  public static parse(diffStr: string): TextDiff {
    TextDiff.assertParam(diffStr, 'diffStr');

    const diffJson: any = JSON.parse(diffStr);
    return new TextDiff(diffJson.patch);
  }

  // TODO: Code duplication. Extract to some Util class
  private static assertParam(param: any, paramName: string) {
    if (param === null || param === undefined) {
      throw new Error(`${paramName} param has to be non-null and non-undefined`);
    }
  }

  public constructor(private patch: string) {
    TextDiff.assertParam(patch, 'patch');
  }

  public toString(): string {
    return JSON.stringify(this);
  }

  public getPatch(): string {
    return this.patch;
  }
}
