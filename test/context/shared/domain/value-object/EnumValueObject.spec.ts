import { EnumValueObject } from 'src/context/shared/domain/value-object/EnumValueObject';

class EnumValueObjectMock extends EnumValueObject<string> {
  protected throwErrorForInvalidValue(value: string): void {
    throw new Error(`Invalid value: ${value}`);
  }
}

describe('EnumValueObject', () => {
  it('should create a valid instance', () => {
    const vo = new EnumValueObjectMock('A', ['A', 'B']);
    expect(vo.value).toBe('A');
  });

  it('should throw error for invalid value', () => {
    expect(() => new EnumValueObjectMock('C', ['A', 'B'])).toThrow(
      'Invalid value: C',
    );
  });
});
