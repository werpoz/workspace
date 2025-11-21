import { Identity } from 'src/context/identity/domain/Identity';
import { IdentityID } from 'src/context/identity/domain/value-object/IdentityID.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { Provider } from 'src/context/identity/domain/value-object/Provider.vo';
import { Uuid } from 'src/context/shared/domain/value-object/Uuid';
import { IdentityCreatedDomainEvent } from 'src/context/identity/domain/events/IdentityCreatedDomainEvent';

describe('Identity', () => {
    const id = new IdentityID(Uuid.random().value);
    const accountId = new AccountID(Uuid.random().value);
    const provider = new Provider('email');
    const externalId = 'ext-123';

    it('should create an identity', () => {
        const identity = Identity.create(id, provider, externalId, accountId);

        expect(identity.id).toBe(id);
        expect(identity.provider).toBe(provider);
        expect(identity.externalId).toBe(externalId);
        expect(identity.accountId).toBe(accountId);

        const events = identity.pullDomainEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(IdentityCreatedDomainEvent);
    });

    it('should create from primitives', () => {
        const identity = Identity.fromPrimitives({
            id: id.value,
            provider: provider,
            externalId: externalId,
            accountId: accountId.value,
        });

        expect(identity.id.value).toBe(id.value);
        expect(identity.provider.value).toBe(provider.value);
        expect(identity.externalId).toBe(externalId);
        expect(identity.accountId.value).toBe(accountId.value);
    });

    it('should convert to primitives', () => {
        const identity = Identity.create(id, provider, externalId, accountId);
        const primitives = identity.toPrimitives();

        expect(primitives).toEqual({
            id: id.value,
            provider: provider,
            externalId: externalId,
            accountId: accountId.value,
        });
    });
});
