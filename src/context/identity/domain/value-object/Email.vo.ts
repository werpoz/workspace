import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';
import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';

export class Email extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new InvalidArgumentError(`Email <${value}> is not valid`);
    }
  }
}
