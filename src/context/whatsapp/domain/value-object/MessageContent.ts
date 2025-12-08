import { ValueObject } from "src/context/shared/domain/value-object/ValueObject";
import { InvalidArgumentError } from "src/context/shared/domain/value-object/InvalidArgumentError";

export class MessageContent extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.ensureValidContent(value);
  }

  private ensureValidContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new InvalidArgumentError('Message content cannot be empty');
    }

    if (content.length > 4096) {
      throw new InvalidArgumentError('Message content too long');
    }
  }

}