import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { NestCqrsEventBus } from 'src/context/shared/infrastructure/NestCqrsEventBus';
import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

class MockEvent extends DomainEvent {
  static EVENT_NAME = 'mock.event';
  constructor() {
    super({ eventName: MockEvent.EVENT_NAME, aggregateId: '1' });
  }
  toPrimitives() {
    return {};
  }
}

describe('NestCqrsEventBus', () => {
  let service: NestCqrsEventBus;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NestCqrsEventBus,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NestCqrsEventBus>(NestCqrsEventBus);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should publish a single event', async () => {
    const event = new MockEvent();
    await service.publish(event);
    expect(eventBus.publish).toHaveBeenCalledWith(event);
  });

  it('should publish multiple events', async () => {
    const events = [new MockEvent(), new MockEvent()];
    await service.publishAll(events);
    expect(eventBus.publish).toHaveBeenCalledTimes(2);
  });

  it('should be instantiated manually', () => {
    const bus = new NestCqrsEventBus({ publish: jest.fn() } as any);
    expect(bus).toBeDefined();
    expect(bus['eventBus']).toBeDefined();
  });

  it('should handle undefined eventBus manually', () => {
    const bus = new NestCqrsEventBus(undefined as any);
    expect(bus).toBeDefined();
  });
});
