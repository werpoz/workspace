import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';
import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';

export class EmailBody extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (value.trim().length === 0) {
      throw new InvalidArgumentError('Email body cannot be empty');
    }
  }
}
