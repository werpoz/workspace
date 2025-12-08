import { EnumValueObject } from "src/context/shared/domain/value-object/EnumValueObject";
import { InvalidArgumentError } from "src/context/shared/domain/value-object/InvalidArgumentError";


export enum MessageTypeValues {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  CONTACT = 'contact',
  LOCATION = 'location',
  REACTION = 'reaction'
}

export class MessageType extends EnumValueObject<MessageTypeValues> {
  constructor(value: MessageTypeValues) {
    super(value, Object.values(MessageTypeValues));
  }

  protected throwErrorForInvalidValue(value: MessageTypeValues): void {
    throw new InvalidArgumentError(`Invalid message type: ${value}`);
  }

  static createText(): MessageType {
    return new MessageType(MessageTypeValues.TEXT);
  }

  static createImage(): MessageType {
    return new MessageType(MessageTypeValues.IMAGE);
  }

  static createAudio(): MessageType {
    return new MessageType(MessageTypeValues.AUDIO);
  }

  static createVideo(): MessageType {
    return new MessageType(MessageTypeValues.VIDEO);
  }

  static createDocument(): MessageType {
    return new MessageType(MessageTypeValues.DOCUMENT);
  }

  isText(): boolean {
    return this.value === MessageTypeValues.TEXT;
  }

  isMedia(): boolean {
    return [
      MessageTypeValues.IMAGE,
      MessageTypeValues.AUDIO,
      MessageTypeValues.VIDEO,
      MessageTypeValues.DOCUMENT,
      MessageTypeValues.STICKER,
    ].includes(this.value);
  }

  isDocument(): boolean {
    return this.value === MessageTypeValues.DOCUMENT;
  }
}
