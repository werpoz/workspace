import { AggregateRoot } from 'src/context/shared/domain/AggregateRoot';
import { ItemId } from './value-object/ItemId.vo';
import { ItemTitle } from './value-object/ItemTitle.vo';
import { ItemDescription } from './value-object/ItemDescription.vo';
import { ItemCategory } from './value-object/ItemCategory.vo';
import { ItemCondition } from './value-object/ItemCondition.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { ItemCreatedDomainEvent } from './events/ItemCreatedDomainEvent';

export class Item extends AggregateRoot {
    readonly id: ItemId;
    readonly title: ItemTitle;
    readonly description: ItemDescription;
    readonly category: ItemCategory;
    readonly condition: ItemCondition;
    readonly ownerId: AccountID;
    readonly images: string[]; // URLs to images
    readonly createdAt: Date;

    constructor(
        id: ItemId,
        title: ItemTitle,
        description: ItemDescription,
        category: ItemCategory,
        condition: ItemCondition,
        ownerId: AccountID,
        images: string[],
        createdAt: Date,
    ) {
        super();
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.condition = condition;
        this.ownerId = ownerId;
        this.images = images;
        this.createdAt = createdAt;
    }

    static create(
        id: ItemId,
        title: ItemTitle,
        description: ItemDescription,
        category: ItemCategory,
        condition: ItemCondition,
        ownerId: AccountID,
        images: string[] = [],
    ): Item {
        const item = new Item(
            id,
            title,
            description,
            category,
            condition,
            ownerId,
            images,
            new Date(),
        );

        item.record(
            new ItemCreatedDomainEvent({
                aggregateId: id.value,
                title: title.value,
                ownerId: ownerId.value,
                category: category.value,
            }),
        );

        return item;
    }

    toPrimitives() {
        return {
            id: this.id.value,
            title: this.title.value,
            description: this.description.value,
            category: this.category.value,
            condition: this.condition.value,
            ownerId: this.ownerId.value,
            images: this.images,
            createdAt: this.createdAt.toISOString(),
        };
    }
}
