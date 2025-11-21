import { Test, TestingModule } from '@nestjs/testing';
import { AccountCreatedHandler } from 'src/context/identity/application/handlers/AccountCreatedHandler';
import { AccountCreatedDomainEvent } from 'src/context/identity/domain/events/AccountCreatedDomainEvent';

describe('AccountCreatedHandler', () => {
    let handler: AccountCreatedHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AccountCreatedHandler],
        }).compile();

        handler = module.get<AccountCreatedHandler>(AccountCreatedHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should handle event', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const event = new AccountCreatedDomainEvent({
            aggregateId: '123',
            email: 'test@example.com',
        });

        handler.handle(event);

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
