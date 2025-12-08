import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/context/shared/infrastructure/database/redis.provider';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdempotencyService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async withInboundDedupe<T>(
    key: string,
    ttlSeconds: number,
    handler: () => Promise<T>,
  ): Promise<T | null> {
    const token = uuidv4();
    const ok = await this.redis.set(key, token, 'EX', ttlSeconds, 'NX');
    if (!ok) {
      return null;
    }
    return handler();
  }

  async withOutboundIdempotency<T>(
    key: string,
    ttlSeconds: number,
    handler: () => Promise<T>,
  ): Promise<T | null> {
    const token = uuidv4();
    const ok = await this.redis.set(key, token, 'EX', ttlSeconds, 'NX');
    if (!ok) {
      return null;
    }
    return handler();
  }
}
