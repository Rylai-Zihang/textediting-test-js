import { TextDiffCalculator, CreatePatchFunc, ApplyPatchFunc } from '../src/TextDiffCalculator';
import { TextDiff } from '../src/TextDiff';

function createCalculator(
    createPatchFunc: CreatePatchFunc,
    applyPatchFunc: ApplyPatchFunc,
  ): TextDiffCalculator {

  return new TextDiffCalculator(createPatchFunc, applyPatchFunc);
}

function createCalculatorCreateOnly(createPatchFunc: CreatePatchFunc): TextDiffCalculator {
  return createCalculator(
    createPatchFunc,
    (str: string, patch: string): string => {
      throw new Error('Should not be called from tests');
    });
}

function createCalculatorApplyOnly(applyPatchFunc: ApplyPatchFunc): TextDiffCalculator {
  return createCalculator(
    (oldStr: string, newStr: string): string => {
      throw new Error('Should not be called from tests');
    },
    applyPatchFunc);
}

function createCalculatorNoFunctions(): TextDiffCalculator {
  return createCalculator(
    (oldStr: string, newStr: string): string => {
      throw new Error('Should not be called from tests');
    },
    (str: string, patch: string): string => {
      throw new Error('Should not be called from tests');
    });
}

describe('calculate', () => {

  let calculator: TextDiffCalculator;

  beforeEach(() => {
    calculator = createCalculatorNoFunctions();
  });

  it('should return TextDiff instance', () => {
    calculator = createCalculatorCreateOnly(
      (fileName: string, oldStr: string, newStr: string): string => {
        return '';
      });

    expect(calculator.calculate('', ''))
      .toBeInstanceOf(TextDiff);
  });

  it('should not hide errors from "diff" module`s "createPatch" function', () => {
    const testError = 'Test Error';

    calculator = createCalculatorCreateOnly(
      (fileName: string, oldStr: string, newStr: string): string => {
        throw new Error(testError);
      });

    expect(() => {
      calculator.calculate('', '');
    }).toThrowError(testError);
  });

  it('should pass proper parameters to "diff" module`s "createPatch" function', () => {
    const oldStr = 'old string';
    const newStr = 'new string';

    const mockCreateFunction = jest.fn(() => '');

    calculator = createCalculatorCreateOnly(mockCreateFunction);
    calculator.calculate(oldStr, newStr);

    expect(mockCreateFunction)
      .toBeCalledWith(expect.any(String), oldStr, newStr);
  });

  it('should return "diff" module`s "createPatch" function result wrapped by TextDiff', () => {
    const patch = 'resulting patch';

    const mockCreateFunction = jest.fn(() => patch);

    calculator = createCalculatorCreateOnly(mockCreateFunction);
    const result: TextDiff = calculator.calculate('', '');

    expect(result.getPatch())
      .toEqual(patch);
  });
});

describe('apply', () => {

  let calculator: TextDiffCalculator;

  beforeEach(() => {
    calculator = createCalculatorNoFunctions();
  });

  it('should return string', () => {
    calculator = createCalculatorApplyOnly(
      (text: string, patch: string): string => {
        return '';
      });

    const result = calculator.apply('', new TextDiff(''));
    expect(typeof result)
      .toEqual('string');
  });

  it('should not hide errors from "diff" module`s "applyPatch" function', () => {
    const testError = 'Test Error';

    calculator = createCalculatorApplyOnly(
      (text: string, patch: string): string => {
        throw new Error(testError);
      });

    expect(() => {
      calculator.apply('', new TextDiff(''));
    }).toThrowError(testError);
  });

  it('should pass proper parameters to "diff" module`s "applyPatch" function', () => {
    const text = 'test text';
    const patch = 'patch';

    const mockApplyFunction = jest.fn();

    calculator = createCalculatorApplyOnly(mockApplyFunction);
    calculator.apply(text, new TextDiff(patch));

    expect(mockApplyFunction)
      .toBeCalledWith(text, patch);
  });

  it('should return "diff" module`s "applyPatch" function result', () => {
    const resultingText = 'test text after patch applied';

    const mockApplyFunction = jest.fn(() => resultingText);

    calculator = createCalculatorApplyOnly(mockApplyFunction);
    const result = calculator.apply('', new TextDiff(''));

    expect(result)
      .toEqual(resultingText);
  });

});
