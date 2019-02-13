import { TextDiff } from '../src/TextDiff';

describe('parse', () => {

  it('should throw an error if null is passed', () => {
    expect(() => {
      TextDiff.parse(null);
    }).toThrow();
  });

  it('should throw an error if empty string is passed', () => {
    expect(() => {
      TextDiff.parse('');
    }).toThrow();
  });

  it('should throw an error if non-object string is passed', () => {
    expect(() => {
      TextDiff.parse('test');
    }).toThrow();
  });

  it('should throw an error if empty object string is passed', () => {
    expect(() => {
      TextDiff.parse('{}');
    }).toThrow();
  });

  it('should throw an error if object without "patch" field passed', () => {
    expect(() => {
      TextDiff.parse('{ "test": "test" }');
    }).toThrow();
  });

  it('should work without errors if object with "patch" field passed', () => {
    const testPatch = 'test patch';
    const diff: TextDiff = TextDiff.parse(`{ "patch": "${testPatch}" }`);
    expect(diff.getPatch())
      .toEqual(testPatch);
  });

  it('should work without errors if object with "patch" and extra fields passed', () => {
    const testPatch = 'test patch';
    const diff: TextDiff = TextDiff.parse(
      `{ "patch": "${testPatch}", "someField": 4, "field": "test" }`);
    expect(diff.getPatch())
      .toEqual(testPatch);
  });

});

describe('toString', () => {

  it('should return json string with "patch field"', () => {
    const testPatch = 'test patch';
    const diff: TextDiff = new TextDiff(testPatch);

    expect(diff.toString())
      .toEqual(`{"patch":"${testPatch}"}`);
  });
});
