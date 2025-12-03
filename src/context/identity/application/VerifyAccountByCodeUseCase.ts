import { Inject, Injectable } from '@nestjs/common';
import type { EmailVerificationRepository } from '../domain/interface/EmailVerificationRepository';
import type { AccountRepository } from '../domain/interface/AccountRepository';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { AccountVerifiedDomainEvent } from '../domain/events/AccountVerifiedDomainEvent';

@Injectable()
export class VerifyAccountByCodeUseCase {
    constructor(
        @Inject('EmailVerificationRepository')
        private readonly verificationRepository: EmailVerificationRepository,
        @Inject('AccountRepository')
        private readonly accountRepository: AccountRepository,
        @Inject('DomainEventBus')
        private readonly eventBus: DomainEventBus,
    ) { }

    async execute(params: { email: string; code: string }): Promise<void> {
        const account = await this.accountRepository.searchByEmail(params.email);

        if (!account) {
            throw new Error('Account not found');
        }

        const verification = await this.verificationRepository.findByAccountIdAndCode(
            account.id.value,
            params.code,
        );

        if (!verification) {
            throw new Error('Invalid or expired verification code');
        }

        if (!verification.isValid()) {
            if (verification.attempts >= 3) {
                throw new Error('Maximum verification attempts exceeded');
            }
            if (verification.isExpired()) {
                throw new Error('Verification code has expired');
            }
        }

        // Mark verification as complete
        verification.verify();
        await this.verificationRepository.save(verification);

        // Update account status
        account.verify();
        await this.accountRepository.update(account);

        // Publish event
        await this.eventBus.publishAll([
            new AccountVerifiedDomainEvent({
                aggregateId: account.id.value,
                email: account.email.value,
                verifiedAt: new Date().toISOString(),
            }),
        ]);
    }
}
