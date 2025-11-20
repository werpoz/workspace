import { Test, TestingModule } from '@nestjs/testing';
import { EmailCreateEventWebhook } from './EmailCreatedEventWebhook';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { Webhook } from 'svix';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';

jest.mock('svix');

describe('EmailCreateEventWebhook', () => {
    let controller: EmailCreateEventWebhook;
    let configService: ConfigService;
    let eventBus: EventBus;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EmailCreateEventWebhook],
            providers: [
                {
                    provide: ConfigService,
                    useValue: {
                        getOrThrow: jest.fn().mockReturnValue('test_secret'),
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
        configService = module.get<ConfigService>(ConfigService);
        eventBus = module.get<EventBus>(EventBus);
    });

    it('should verify signature using rawBody', () => {
        const mockVerify = jest.fn();
        (Webhook as unknown as jest.Mock).mockImplementation(() => ({
            verify: mockVerify,
        }));

        const rawBody = Buffer.from('{"type":"user.created"}');
        const request = {
            headers: {
                'svix-id': 'id',
                'svix-signature': 'sig',
                'svix-timestamp': 'ts',
            },
            rawBody: rawBody,
        } as unknown as RawBodyRequest<Request>;

        const body: any = { type: 'user.created', data: { email_addresses: [{ email_address: 'test@example.com' }] } };

        controller.register(request, body);

        expect(mockVerify).toHaveBeenCalledWith(rawBody, {
            'svix-id': 'id',
            'svix-signature': 'sig',
            'svix-timestamp': 'ts',
        });
    });

    it('should throw error if rawBody is missing', () => {
        const request = {
            headers: {},
        } as unknown as RawBodyRequest<Request>;

        const body: any = {};

        expect(() => controller.register(request, body)).toThrow('Webhook Error: Missing raw body');
    });
});
