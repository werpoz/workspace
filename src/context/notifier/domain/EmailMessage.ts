import { EmailAddress } from './value-object/EmailAddress.vo';
import { EmailSubject } from './value-object/EmailSubject.vo';
import { EmailBody } from './value-object/EmailBody.vo';

export class EmailMessage {
  constructor(
    private readonly to: EmailAddress,
    private readonly subject: EmailSubject,
    private readonly body: EmailBody,
  ) {}

  get toAddress(): string {
    return this.to.value;
  }

  get emailSubject(): string {
    return this.subject.value;
  }

  get emailBody(): string {
    return this.body.value;
  }

  toPrimitives() {
    return {
      to: this.to.value,
      subject: this.subject.value,
      body: this.body.value,
    };
  }

  static fromPrimitives(params: { to: string; subject: string; body: string }) {
    return new EmailMessage(
      new EmailAddress(params.to),
      new EmailSubject(params.subject),
      new EmailBody(params.body),
    );
  }
}
