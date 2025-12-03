import { EmailVerification } from '../EmailVerification';
import { Nullable } from 'src/context/shared/domain/Nullable';

export interface EmailVerificationRepository {
    save(verification: EmailVerification): Promise<void>;
    findById(id: string): Promise<Nullable<EmailVerification>>;
    findByToken(token: string): Promise<Nullable<EmailVerification>>;
    findByAccountIdAndCode(
        accountId: string,
        code: string,
    ): Promise<Nullable<EmailVerification>>;
    findActiveByAccountId(accountId: string): Promise<Nullable<EmailVerification>>;
    findUnverifiedAccountsOlderThan(hours: number): Promise<EmailVerification[]>;
}
