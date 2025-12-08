import { EnumValueObject } from 'src/context/shared/domain/value-object/EnumValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

export enum WhatsappSessionStatusValues {
  PENDING = 'pending',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  FAILED = 'failed',
  QR_SCANNING = 'qr_scanning'
}

export class WhatsappSessionStatus extends EnumValueObject<WhatsappSessionStatusValues> {
  constructor(value: WhatsappSessionStatusValues) {
    super(value, Object.values(WhatsappSessionStatusValues));
  }

  protected throwErrorForInvalidValue(value: WhatsappSessionStatusValues): void {
    throw new InvalidArgumentError(`Invalid session status: ${value}`);
  }

  static createPending(): WhatsappSessionStatus {
    return new WhatsappSessionStatus(WhatsappSessionStatusValues.PENDING);
  }

  static createConnected(): WhatsappSessionStatus {
    return new WhatsappSessionStatus(WhatsappSessionStatusValues.CONNECTED);
  }

  static createDisconnected(): WhatsappSessionStatus {
    return new WhatsappSessionStatus(WhatsappSessionStatusValues.DISCONNECTED);
  }

  static createFailed(): WhatsappSessionStatus {
    return new WhatsappSessionStatus(WhatsappSessionStatusValues.FAILED);
  }

  static createQrScanning(): WhatsappSessionStatus {
    return new WhatsappSessionStatus(WhatsappSessionStatusValues.QR_SCANNING);
  }

  isPending(): boolean {
    return this.value === WhatsappSessionStatusValues.PENDING;
  }

  isConnected(): boolean {
    return this.value === WhatsappSessionStatusValues.CONNECTED;
  }

  isDisconnected(): boolean {
    return this.value === WhatsappSessionStatusValues.DISCONNECTED;
  }
}