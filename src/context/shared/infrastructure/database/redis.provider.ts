import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const redisUrl = configService.get<string>('REDIS_URL');
    const useTls = configService.get<boolean>('REDIS_TLS') ?? false;
    const client = new Redis(redisUrl ?? '', {
      tls: useTls ? {} : undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    client.on('error', (err) => {
      console.error('[redis] connection error', err);
    });

    return client;
  },
};
