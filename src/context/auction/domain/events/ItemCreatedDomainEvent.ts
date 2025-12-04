import { DomainEvent } from 'src/context/shared/domain/DomainEvent';

export class ItemCreatedDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'item.created';

    readonly title: string;
    readonly ownerId: string;
    readonly category: string;

    constructor({
        aggregateId,
        title,
        ownerId,
        category,
        eventId,
        occurredOn,
    }: {
        aggregateId: string;
        title: string;
        ownerId: string;
        category: string;
        eventId?: string;
        occurredOn?: Date;
    }) {
        super({
            eventName: ItemCreatedDomainEvent.EVENT_NAME,
            aggregateId,
            eventId,
            occurredOn,
        });
        this.title = title;
        this.ownerId = ownerId;
        this.category = category;
    }

    toPrimitives() {
        return {
            aggregateId: this.aggregateId,
            title: this.title,
            ownerId: this.ownerId,
            category: this.category,
            eventName: ItemCreatedDomainEvent.EVENT_NAME,
            eventId: this.eventId,
            occurredOn: this.occurredOn,
        };
    }

    static fromPrimitives(params: {
        aggregateId: string;
        attributes: any;
        eventId: string;
        occurredOn: Date;
    }): DomainEvent {
        const { title, ownerId, category } = params.attributes;
        return new ItemCreatedDomainEvent({
            aggregateId: params.aggregateId,
            title,
            ownerId,
            category,
            eventId: params.eventId,
            occurredOn: params.occurredOn,
        });
    }
}
