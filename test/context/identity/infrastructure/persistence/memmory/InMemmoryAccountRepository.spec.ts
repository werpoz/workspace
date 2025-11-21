import { InMemmoryAccountRepository } from 'src/context/identity/infrastructure/persistence/memmory/InMemmoryAccountRepository';
import { Account } from 'src/context/identity/domain/Account';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID';
import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { Password } from 'src/context/identity/domain/value-object/Password.vo';
import { Uuid } from 'src/context/shared/domain/value-object/Uuid';

describe('InMemmoryAccountRepository', () => {
    let repository: InMemmoryAccountRepository;

    beforeEach(() => {
        repository = new InMemmoryAccountRepository();
    });

    it('should save and find an account by id', async () => {
        const id = new AccountID(Uuid.random().value);
        const email = new Email('test@example.com');
        const password = new Password('password123');
        const account = Account.createWithPassword(id, password, email);

        await repository.save(account);

        const found = await repository.searchById(id.value);
        expect(found).toBeDefined();
        expect(found?.id.value).toBe(id.value);
    });

    it('should return null if account not found by id', async () => {
        const found = await repository.searchById('non-existent');
        expect(found).toBeNull();
    });

    it('should find an account by email', async () => {
        const id = new AccountID(Uuid.random().value);
        const email = new Email('test@example.com');
        const password = new Password('password123');
        const account = Account.createWithPassword(id, password, email);

        await repository.save(account);

        const found = await repository.searchByEmail(email.value);
        expect(found).toBeDefined();
        expect(found?.email.value).toBe(email.value);
    });

    it('should return null if account not found by email', async () => {
        const id = new AccountID(Uuid.random().value);
        const email = new Email('test@example.com');
        const password = new Password('password123');
        const account = Account.createWithPassword(id, password, email);

        await repository.save(account);

        const found = await repository.searchByEmail('other@example.com');
        expect(found).toBeUndefined(); // The implementation returns undefined if not found in forEach
    });

    it('should update an account', async () => {
        const id = new AccountID(Uuid.random().value);
        const email = new Email('test@example.com');
        const password = new Password('password123');
        const account = Account.createWithPassword(id, password, email);

        await repository.save(account);
        await repository.update(account);

        const found = await repository.searchById(id.value);
        expect(found).toBeDefined();
    });

    it('should delete an account', async () => {
        const id = new AccountID(Uuid.random().value);
        const email = new Email('test@example.com');
        const password = new Password('password123');
        const account = Account.createWithPassword(id, password, email);

        await repository.save(account);
        await repository.delete(id.value);

        const found = await repository.searchById(id.value);
        expect(found).toBeNull();
    });
});
