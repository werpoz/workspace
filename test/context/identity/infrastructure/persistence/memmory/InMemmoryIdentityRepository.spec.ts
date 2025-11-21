
import { InMemmoryIdentityRepository } from 'src/context/identity/infrastructure/persistence/memmory/InMemmoryIdentityRepository';
import { Identity } from 'src/context/identity/domain/Identity';
import { IdentityID } from 'src/context/identity/domain/value-object/IdentityID.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { Provider } from 'src/context/identity/domain/value-object/Provider.vo';
import { Uuid } from 'src/context/shared/domain/value-object/Uuid';
import { Account } from 'src/context/identity/domain/Account';
import { Email } from 'src/context/identity/domain/value-object/Email.vo';

describe('InMemmoryIdentityRepository', () => {
    let repository: InMemmoryIdentityRepository;

    beforeEach(() => {
        repository = new InMemmoryIdentityRepository();
    });

    it('should save and find an identity by id', async () => {
        const id = new IdentityID(Uuid.random().value);
        const accountId = new AccountID(Uuid.random().value);
        const provider = new Provider('email');
        const identity = Identity.create(id, provider, 'ext-123', accountId);

        await repository.save(identity);

        const found = await repository.searchById(id.value);
        expect(found).toBeDefined();
        expect(found?.id.value).toBe(id.value);
    });

    it('should return null if identity not found by id', async () => {
        const found = await repository.searchById('non-existent');
        expect(found).toBeNull();
    });

    it('should find an identity by external id (account)', async () => {
        const id = new IdentityID(Uuid.random().value);
        const accountId = new AccountID(Uuid.random().value);
        const provider = new Provider('email');
        const identity = Identity.create(id, provider, 'ext-123', accountId);

        await repository.save(identity);

        const account = Account.createExternal(accountId, new Email('test@example.com'));
        const found = await repository.searchByExternalId(account);
        expect(found).toBeDefined();
        expect(found?.id.value).toBe(id.value);
    });

    it('should return null if identity not found by external id', async () => {
        const id = new IdentityID(Uuid.random().value);
        const accountId = new AccountID(Uuid.random().value);
        const provider = new Provider('email');
        const identity = Identity.create(id, provider, 'ext-123', accountId);

        await repository.save(identity);

        const otherAccount = Account.createExternal(new AccountID(Uuid.random().value), new Email('test@example.com'));
        const found = await repository.searchByExternalId(otherAccount);
        expect(found).toBeUndefined();
    });

    it('should update an identity', async () => {
        const id = new IdentityID(Uuid.random().value);
        const accountId = new AccountID(Uuid.random().value);
        const provider = new Provider('email');
        const identity = Identity.create(id, provider, 'ext-123', accountId);

        await repository.save(identity);
        await repository.update(identity);

        const found = await repository.searchById(id.value);
        expect(found).toBeDefined();
    });

    it('should delete an identity', async () => {
        const id = new IdentityID(Uuid.random().value);
        const accountId = new AccountID(Uuid.random().value);
        const provider = new Provider('email');
        const identity = Identity.create(id, provider, 'ext-123', accountId);

        await repository.save(identity);
        await repository.delete(id.value);

        const found = await repository.searchById(id.value);
        expect(found).toBeNull();
    });
});
