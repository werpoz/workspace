// infra/event-bus/event-bus.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NestCqrsEventBus } from './infrastructure/NestCqrsEventBus';

@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: 'DomainEventBus',
      useClass: NestCqrsEventBus,
    },
  ],
  exports: ['DomainEventBus'],
})
export class EventBusModule {}
