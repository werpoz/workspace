import { Inject, Injectable } from '@nestjs/common';
import { RequestAccountVerificationUseCase } from './RequestAccountVerificationUseCase';
import type { AccountRepository } from '../domain/interface/AccountRepository';

@Injectable()
export class ResendVerificationUseCase {
    constructor(
        @Inject('AccountRepository')
        private readonly accountRepository: AccountRepository,
        private readonly requestVerificationUseCase: RequestAccountVerificationUseCase,
    ) { }

    async execute(params: {
        email: string;
        method?: 'email_link' | 'email_code';
    }): Promise<void> {
        const account = await this.accountRepository.searchByEmail(params.email);

        if (!account) {
            throw new Error('Account not found');
        }

        if (account.status.isActive()) {
            throw new Error('Account is already verified');
        }

        // Simply create a new verification request
        await this.requestVerificationUseCase.execute({
            accountId: account.id.value,
            method: params.method,
        });
    }
}
