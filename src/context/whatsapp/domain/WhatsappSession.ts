import { AggregateRoot } from "src/context/shared/domain/AggregateRoot";
import { WhatsappSessionId } from "./value-object/WhatsappSessionId";
import { PhoneNumber } from "./value-object/PhoneNumber";
import { WhatsappSessionStatus } from "./value-object/WhatsappSessionStatus";
import { WhatsappSessionCreatedDomainEvent } from "./events/WhatsappSessionCreatedDomainEvent";
import { WhatsappSessionConnectedDomainEvent } from "./events/WhatsappSessionConnectedDomainEvent";
import { WhatsappSessionDisconnectedDomainEvent } from "./events/WhatsappSessionDisconnectedDomainEvent";


export class WhatsappSession extends AggregateRoot {
  constructor(
    public readonly id: WhatsappSessionId,
    public readonly phoneNumber: PhoneNumber,
    private status: WhatsappSessionStatus,
    public readonly createdAt: Date,
    private updatedAt: Date,
    private lastConnectionAt?: Date,
    private lastDisconnectionAt?: Date,
    private qrCode?: string,
    private connectionState?: string
  ) {
    super();
  }

  static create(phoneNumber: PhoneNumber): WhatsappSession {
    const session = new WhatsappSession(
      WhatsappSessionId.random(),
      phoneNumber,
      WhatsappSessionStatus.createPending(),
      new Date(),
      new Date()
    );

    session.record(new WhatsappSessionCreatedDomainEvent({
      aggregateId: session.id.value,
      phoneNumber: session.phoneNumber.value,
      status: session.status.value
    }));

    return session;
  }

  connect(qrCode?: string): void {
    this.status = WhatsappSessionStatus.createConnected();
    this.lastConnectionAt = new Date();
    this.updatedAt = new Date();
    this.qrCode = qrCode;
    this.connectionState = 'connected';

    this.record(new WhatsappSessionConnectedDomainEvent({
      aggregateId: this.id.value,
      phoneNumber: this.phoneNumber.value,
      qrCode: qrCode
    }));
  }

  disconnect(reason?: string): void {
    this.status = WhatsappSessionStatus.createDisconnected();
    this.lastDisconnectionAt = new Date();
    this.updatedAt = new Date();
    this.connectionState = reason || 'disconnected';

    this.record(new WhatsappSessionDisconnectedDomainEvent({
      aggregateId: this.id.value,
      phoneNumber: this.phoneNumber.value,
      reason: reason
    }));
  }

  updateQrCode(qrCode: string): void {
    this.qrCode = qrCode;
    this.updatedAt = new Date();
  }

  updateConnectionState(state: string): void {
    this.connectionState = state;
    this.updatedAt = new Date();
  }

  getStatus(): WhatsappSessionStatus {
    return this.status;
  }

  getQrCode(): string | undefined {
    return this.qrCode;
  }

  getConnectionState(): string | undefined {
    return this.connectionState;
  }

  toPrimitives() {
    return {
      id: this.id.value,
      phoneNumber: this.phoneNumber.value,
      status: this.status.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastConnectionAt: this.lastConnectionAt,
      lastDisconnectionAt: this.lastDisconnectionAt,
      qrCode: this.qrCode,
      connectionState: this.connectionState
    };
  }
}