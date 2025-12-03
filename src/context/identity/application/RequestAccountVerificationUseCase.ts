import { Inject, Injectable } from '@nestjs/common';
import { EmailVerification } from '../domain/EmailVerification';
import type { EmailVerificationRepository } from '../domain/interface/EmailVerificationRepository';
import type { AccountRepository } from '../domain/interface/AccountRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { VerificationMethod } from '../domain/value-object/VerificationMethod.vo';
import { AccountID } from '../domain/value-object/AccountID.vo';
import { AccountVerificationRequestedDomainEvent } from '../domain/events/AccountVerificationRequestedDomainEvent';

@Injectable()
export class RequestAccountVerificationUseCase {
    constructor(
        @Inject('EmailVerificationRepository')
        private readonly verificationRepository: EmailVerificationRepository,
        @Inject('AccountRepository')
        private readonly accountRepository: AccountRepository,
        @Inject('DomainEventBus')
        private readonly eventBus: DomainEventBus,
    ) { }

    async execute(params: {
        accountId: string;
        method?: 'email_link' | 'email_code';
    }): Promise<void> {
        const account = await this.accountRepository.searchById(params.accountId);

        if (!account) {
            throw new Error('Account not found');
        }

        // Default to email_code
        const method = params.method === 'email_link'
            ? VerificationMethod.emailLink()
            : VerificationMethod.emailCode();

        // Create verification (30 minutes expiry)
        const verification = EmailVerification.create(
            new AccountID(params.accountId),
            method,
            30,
        );

        await this.verificationRepository.save(verification);

        // Publish event
        await this.eventBus.publishAll([
            new AccountVerificationRequestedDomainEvent({
                aggregateId: account.id.value,
                email: account.email.value,
                method: method.value as 'email_link' | 'email_code',
                verificationId: verification.id.value,
                token: verification.token?.value,
                code: verification.code?.value,
            }),
        ]);
    }
}
