import { EnumValueObject } from "src/context/shared/domain/value-object/EnumValueObject";
import { InvalidArgumentError } from "src/context/shared/domain/value-object/InvalidArgumentError";

export enum MessageDirectionValues {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing'
}

export class MessageDirection extends EnumValueObject<MessageDirectionValues> {
  constructor(value: MessageDirectionValues) {
    super(value, Object.values(MessageDirectionValues));
  }

  protected throwErrorForInvalidValue(value: MessageDirectionValues): void {
    throw new InvalidArgumentError(`Invalid message direction: ${value}`);
  }

  static createIncoming(): MessageDirection {
    return new MessageDirection(MessageDirectionValues.INCOMING);
  }

  static createOutgoing(): MessageDirection {
    return new MessageDirection(MessageDirectionValues.OUTGOING);
  }

  isIncoming(): boolean {
    return this.value === MessageDirectionValues.INCOMING;
  }

  isOutgoing(): boolean {
    return this.value === MessageDirectionValues.OUTGOING;
  }
}