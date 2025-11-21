import { Account } from 'src/context/identity/domain/Account';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID';
import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { Password } from 'src/context/identity/domain/value-object/Password.vo';
import { Uuid } from 'src/context/shared/domain/value-object/Uuid';
import { AccountCreatedDomainEvent } from 'src/context/identity/domain/events/AccountCreatedDomainEvent';

describe('Account', () => {
    const id = new AccountID(Uuid.random().value);
    const email = new Email('test@example.com');
    const password = new Password('password123');

    it('should create an account with password', () => {
        const account = Account.createWithPassword(id, password, email);

        expect(account.id).toBe(id);
        expect(account.email).toBe(email);
        expect(account.password).toBe(password);
        expect(account.isActive).toBe(true);

        const events = account.pullDomainEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(AccountCreatedDomainEvent);
    });

    it('should create an external account', () => {
        const account = Account.createExternal(id, email);

        expect(account.id).toBe(id);
        expect(account.email).toBe(email);
        expect(account.password).toBeNull();
        expect(account.isActive).toBe(true);

        const events = account.pullDomainEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(AccountCreatedDomainEvent);
    });

    it('should create from primitives', () => {
        const account = Account.fromPrimitives({
            id: id.value,
            email: email.value,
            password: password.value,
            isActive: true,
        });

        expect(account.id.value).toBe(id.value);
        expect(account.email.value).toBe(email.value);
        expect(account.password?.value).toBe(password.value);
        expect(account.isActive).toBe(true);
    });

    it('should create from primitives without password', () => {
        const account = Account.fromPrimitives({
            id: id.value,
            email: email.value,
            password: null,
            isActive: true,
        });

        expect(account.id.value).toBe(id.value);
        expect(account.email.value).toBe(email.value);
        expect(account.password).toBeNull();
        expect(account.isActive).toBe(true);
    });

    it('should convert to primitives', () => {
        const account = Account.createWithPassword(id, password, email);
        const primitives = account.toPrimitives();

        expect(primitives).toEqual({
            id: id.value,
            email: email.value,
            password: password.value,
            isActive: true,
        });
    });

    it('should convert to primitives with null password', () => {
        const account = Account.createExternal(id, email);
        const primitives = account.toPrimitives();

        expect(primitives.id).toBe(id.value);
        expect(primitives.email).toBe(email.value);
        expect(primitives.password).toBeNull();
        expect(primitives.isActive).toBe(true);
    });
});
