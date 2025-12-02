import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';
import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';

export class EmailSubject extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (value.trim().length === 0) {
      throw new InvalidArgumentError('Email subject cannot be empty');
    }
    if (value.length > 998) {
      throw new InvalidArgumentError(
        'Email subject is too long (max 998 characters)',
      );
    }
  }
}
