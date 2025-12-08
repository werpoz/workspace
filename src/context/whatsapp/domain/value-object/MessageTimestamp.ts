import { ValueObject } from "src/context/shared/domain/value-object/ValueObject";

export class MessageTimestamp extends ValueObject<Date> {
  constructor(value: Date) {
    super(value);
    this.ensureValidTimestamp(value);
  }

  private ensureValidTimestamp(timestamp: Date): void {
    if (timestamp > new Date()) {
      throw new Error('Message timestamp cannot be in the future');
    }
  }

  static now(): MessageTimestamp {
    return new MessageTimestamp(new Date());
  }

  static fromMillis(millis: number): MessageTimestamp {
    return new MessageTimestamp(new Date(millis));
  }

  toMillis(): number {
    return this.value.getTime();
  }
}