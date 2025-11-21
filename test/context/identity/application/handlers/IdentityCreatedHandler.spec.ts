import { Test, TestingModule } from '@nestjs/testing';
import { IdentityCreatedHandler } from 'src/context/identity/application/handlers/IdentityCreatedHandler';
import { IdentityCreatedDomainEvent } from 'src/context/identity/domain/events/IdentityCreatedDomainEvent';

describe('IdentityCreatedHandler', () => {
    let handler: IdentityCreatedHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [IdentityCreatedHandler],
        }).compile();

        handler = module.get<IdentityCreatedHandler>(IdentityCreatedHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should handle event', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const event = new IdentityCreatedDomainEvent({
            aggregateId: '123',
            provider: 'email',
            externalId: 'ext-123',
        });

        handler.handle(event);

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
