import bcrypt from 'bcryptjs';
import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export class Password extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureValidLength(value);
  }

  private ensureValidLength(value: string): void {
    if (value.length < 8 || value.length > 64) {
      throw new InvalidArgumentError(
        'Password must be between 8 and 64 characters',
      );
    }
  }

  async hash(): Promise<string> {
    return bcrypt.hash(this.value, 10);
  }

  matches(plain: string): boolean {
    return bcrypt.compareSync(plain, this.value);
  }
}
