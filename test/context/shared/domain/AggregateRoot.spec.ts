import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

class MockEvent extends DomainEvent {
    static EVENT_NAME = 'mock.event';

    constructor(aggregateId: string) {
        super({ eventName: MockEvent.EVENT_NAME, aggregateId });
    }

    toPrimitives() {
        return {};
    }
}

class MockAggregateRoot extends AggregateRoot {
    toPrimitives() {
        return {};
    }
}

describe('AggregateRoot', () => {
    it('should record and pull domain events', () => {
        const aggregate = new MockAggregateRoot();
        const event = new MockEvent('id');

        aggregate.record(event);

        const events = aggregate.pullDomainEvents();

        expect(events).toHaveLength(1);
        expect(events[0]).toBe(event);
        expect(aggregate.pullDomainEvents()).toHaveLength(0);
    });
});
