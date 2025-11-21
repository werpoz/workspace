import { Test, TestingModule } from '@nestjs/testing';
import { EmailCreateEventWebhook } from 'src/context/identity/infrastructure/http/webhook/EmailCreatedEventWebhook';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { Webhook } from 'svix';
import { ExternalUserCreatedEvent } from 'src/context/identity/application/events/ExternalUserCreatedEvent';

jest.mock('svix');

describe('EmailCreateEventWebhook', () => {
    let controller: EmailCreateEventWebhook;
    let eventBus: EventBus;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EmailCreateEventWebhook],
            providers: [
                {
                    provide: ConfigService,
                    useValue: {
                        getOrThrow: jest.fn().mockReturnValue('secret'),
                    },
                },
                {
                    provide: EventBus,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<EmailCreateEventWebhook>(EmailCreateEventWebhook);
        eventBus = module.get<EventBus>(EventBus);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should process webhook and publish event', () => {
        const mockVerify = jest.fn().mockReturnValue({});
        (Webhook as unknown as jest.Mock).mockImplementation(() => ({
            verify: mockVerify,
        }));

        const req = {
            headers: {
                'svix-id': 'id',
                'svix-signature': 'sig',
                'svix-timestamp': 'ts',
            },
            rawBody: Buffer.from('body'),
        } as any;

        const body = {
            type: 'user.created',
            data: {
                id: 'user_123',
                email_addresses: [{ email_address: 'test@example.com' }],
            },
        } as any;

        const result = controller.register(req, body);

        expect(result).toBe(true);
        expect(mockVerify).toHaveBeenCalled();
        expect(eventBus.publish).toHaveBeenCalledWith(expect.any(ExternalUserCreatedEvent));
    });

    it('should ignore non-created events', () => {
        const mockVerify = jest.fn().mockReturnValue({});
        ((Webhook as unknown) as jest.Mock).mockImplementation(() => ({
            verify: mockVerify,
        }));

        const req = {
            headers: {
                'svix-id': 'id',
                'svix-signature': 'sig',
                'svix-timestamp': 'ts',
            },
            rawBody: Buffer.from('body'),
        } as any;

        const body = {
            type: 'user.updated',
            data: {},
        } as any;

        const result = controller.register(req, body);

        expect(result).toBe(true);
        expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle undefined args manually', () => {
        const webhook = new EmailCreateEventWebhook(undefined as any, undefined as any);
        expect(webhook).toBeDefined();
    });

    it('should throw error if rawBody is missing', () => {
        const req = {
            headers: {},
        } as any;
        const body = {} as any;

        expect(() => controller.register(req, body)).toThrow('Webhook Error: Missing raw body');
    });

    it('should be instantiated manually', () => {
        const c = new EmailCreateEventWebhook({} as any, {} as any);
        expect(c).toBeDefined();
        expect(c['configService']).toBeDefined();
        expect(c['eventBus']).toBeDefined();
    });
});
