import { Uuid } from "src/context/shared/domain/value-object/Uuid";


export class MessageId extends Uuid {
  constructor(value: string) {
    super(value);
  }

  static random(): MessageId {
    return new MessageId(Uuid.random().value);
  }
}