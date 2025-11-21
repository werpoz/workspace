import { Test, TestingModule } from '@nestjs/testing';
import { ExternalUserCreatedHandler } from 'src/context/identity/application/handlers/ExternalUserCreatedHandler';
import { RegisterExternalAccountUseCase } from 'src/context/identity/application/RegisterExternalAccountUseCase';
import { ExternalUserCreatedEvent } from 'src/context/identity/application/events/ExternalUserCreatedEvent';

describe('ExternalUserCreatedHandler', () => {
    let handler: ExternalUserCreatedHandler;
    let useCase: RegisterExternalAccountUseCase;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExternalUserCreatedHandler,
                {
                    provide: RegisterExternalAccountUseCase,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<ExternalUserCreatedHandler>(ExternalUserCreatedHandler);
        useCase = module.get<RegisterExternalAccountUseCase>(
            RegisterExternalAccountUseCase,
        );
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should call usecase', async () => {
        const event = new ExternalUserCreatedEvent(
            'test@test.com',
            'externalId',
            'google',
        );

        await handler.handle(event);

        expect(useCase.execute).toHaveBeenCalledWith(
            event.email,
            event.externalId,
            event.provider,
        );
    });

    it('should be instantiated manually', () => {
        const h = new ExternalUserCreatedHandler({} as any);
        expect(h).toBeDefined();
        expect(h['registerExternalAccountUseCase']).toBeDefined();
    });

    it('should handle undefined useCase manually', () => {
        const h = new ExternalUserCreatedHandler(undefined as any);
        expect(h).toBeDefined();
    });
});
