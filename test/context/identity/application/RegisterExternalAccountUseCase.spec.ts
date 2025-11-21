import { Test, TestingModule } from '@nestjs/testing';
import { RegisterExternalAccountUseCase } from 'src/context/identity/application/RegisterExternalAccountUseCase';
import { AccountRepository } from 'src/context/identity/domain/interface/AccountRepository';
import { IdentityRepository } from 'src/context/identity/domain/interface/IdentityRepository';
import { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { Account } from 'src/context/identity/domain/Account';
import { Identity } from 'src/context/identity/domain/Identity';

describe('RegisterExternalAccountUseCase', () => {
    let useCase: RegisterExternalAccountUseCase;
    let accountRepository: AccountRepository;
    let identityRepository: IdentityRepository;
    let eventBus: DomainEventBus;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RegisterExternalAccountUseCase,
                {
                    provide: 'AccountRepository',
                    useValue: {
                        searchByEmail: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: 'IdentityRepository',
                    useValue: {
                        save: jest.fn(),
                    },
                },
                {
                    provide: 'DomainEventBus',
                    useValue: {
                        publishAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<RegisterExternalAccountUseCase>(
            RegisterExternalAccountUseCase,
        );
        accountRepository = module.get<AccountRepository>('AccountRepository');
        identityRepository = module.get<IdentityRepository>('IdentityRepository');
        eventBus = module.get<DomainEventBus>('DomainEventBus');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should register a new external account', async () => {
        const email = 'test@example.com';
        const externalId = 'ext-123';
        const provider = 'google';

        (accountRepository.searchByEmail as jest.Mock).mockResolvedValue(null);

        await useCase.execute(email, externalId, provider);

        expect(accountRepository.searchByEmail).toHaveBeenCalledWith(email);
        expect(identityRepository.save).toHaveBeenCalledWith(expect.any(Identity));
        expect(accountRepository.save).toHaveBeenCalledWith(expect.any(Account));
        expect(eventBus.publishAll).toHaveBeenCalledTimes(2);
    });

    it('should throw error if account already exists', async () => {
        const email = 'test@example.com';
        const externalId = 'ext-123';
        const provider = 'google';

        (accountRepository.searchByEmail as jest.Mock).mockResolvedValue({});

        await expect(useCase.execute(email, externalId, provider)).rejects.toThrow(
            `el usuario ya esta registrado ${email}`,
        );
    });
});
