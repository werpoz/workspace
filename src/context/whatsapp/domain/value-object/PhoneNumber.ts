import { ValueObject } from "src/context/shared/domain/value-object/ValueObject";
import { InvalidArgumentError } from "src/context/shared/domain/value-object/InvalidArgumentError";

export class PhoneNumber extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.ensureValidFormat(value);
  }

  private ensureValidFormat(phoneNumber: string): void {
    // Validación básica de número de teléfono (puede ajustarse según necesidades)
    const phoneRegex = /^[+]?[1-9][\d]{7,14}$/;
    
    if (!phoneRegex.test(phoneNumber)) {
      throw new InvalidArgumentError(`Invalid phone number format: ${phoneNumber}`);
    }
  }
}