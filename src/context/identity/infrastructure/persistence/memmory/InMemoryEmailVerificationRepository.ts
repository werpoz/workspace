import { Injectable } from '@nestjs/common';
import { EmailVerification } from 'src/context/identity/domain/EmailVerification';
import { EmailVerificationRepository } from 'src/context/identity/domain/interface/EmailVerificationRepository';
import { Nullable } from 'src/context/shared/domain/Nullable';

@Injectable()
export class InMemoryEmailVerificationRepository
    implements EmailVerificationRepository {
    private store = new Map<string, EmailVerification>();

    async save(verification: EmailVerification): Promise<void> {
        this.store.set(verification.id.value, verification);
    }

    async findById(id: string): Promise<Nullable<EmailVerification>> {
        return this.store.get(id) ?? null;
    }

    async findByToken(token: string): Promise<Nullable<EmailVerification>> {
        for (const verification of this.store.values()) {
            if (verification.token?.value === token && verification.isValid()) {
                return verification;
            }
        }
        return null;
    }

    async findByAccountIdAndCode(
        accountId: string,
        code: string,
    ): Promise<Nullable<EmailVerification>> {
        for (const verification of this.store.values()) {
            if (
                verification.accountId.value === accountId &&
                verification.code?.value === code &&
                verification.isValid()
            ) {
                return verification;
            }
        }
        return null;
    }

    async findActiveByAccountId(
        accountId: string,
    ): Promise<Nullable<EmailVerification>> {
        for (const verification of this.store.values()) {
            if (
                verification.accountId.value === accountId &&
                !verification.verified &&
                verification.isValid()
            ) {
                return verification;
            }
        }
        return null;
    }

    async findUnverifiedAccountsOlderThan(
        hours: number,
    ): Promise<EmailVerification[]> {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        const results: EmailVerification[] = [];

        for (const verification of this.store.values()) {
            if (!verification.verified && verification.expiresAt < cutoffTime) {
                results.push(verification);
            }
        }

        return results;
    }
}
