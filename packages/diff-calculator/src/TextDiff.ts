import { createPatch, applyPatch } from 'diff';

export class TextDiff {

  public static parse(diffStr: string): TextDiff {
    const diffJson: any = JSON.parse(diffStr);
    return new TextDiff(diffJson.patch);
  }

  public static calculate(currentStr: string, newStr: string): TextDiff {
    const patch = createPatch('text', currentStr, newStr);
    return new TextDiff(patch);
  }

  private constructor(private patch: string) {}

  public apply(text: string): string {
    return applyPatch(text, this.patch);
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}
