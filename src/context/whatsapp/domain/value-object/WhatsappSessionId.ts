import { Uuid } from "src/context/shared/domain/value-object/Uuid";

export class WhatsappSessionId extends Uuid {
  constructor(value: string) {
    super(value);
  }

  static random(): WhatsappSessionId {
    return new WhatsappSessionId(Uuid.random().value);
  }
}