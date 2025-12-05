import { Account } from 'src/context/identity/domain/Account';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { Email } from 'src/context/identity/domain/value-object/Email.vo';
import { Password } from 'src/context/identity/domain/value-object/Password.vo';
import { AccountStatus } from 'src/context/identity/domain/value-object/AccountStatus.vo';

describe('Account Aggregate', () => {
    describe('createWithPassword', () => {
        it('should create account with pending_verification status', () => {
            const id = AccountID.random();
            const password = new Password('hashedPassword123');
            const email = new Email('test@example.com');

            const account = Account.createWithPassword(id, password, email);

            expect(account.id).toBe(id);
            expect(account.email).toBe(email);
            expect(account.status.value).toBe('pending_verification');
            expect(account.isActive).toBe(false);
        });

        it('should publish AccountCreatedDomainEvent', () => {
            const id = AccountID.random();
            const password = new Password('hashedPassword123');
            const email = new Email('test@example.com');

            const account = Account.createWithPassword(id, password, email);

            const events = account.pullDomainEvents();
            expect(events).toHaveLength(1);
            expect(events[0].eventName).toBe('account.created');
        });
    });

    describe('verify', () => {
        it('should change status to active when verified', () => {
            const id = AccountID.random();
            const password = new Password('hashedPassword123');
            const email = new Email('test@example.com');

            const account = Account.createWithPassword(id, password, email);

            expect(account.status.value).toBe('pending_verification');
            expect(account.isActive).toBe(false);

            account.verify();

            expect(account.status.value).toBe('active');
            expect(account.isActive).toBe(true);
        });
    });

    describe('toPrimitives', () => {
        it('should convert account to primitives', () => {
            const id = AccountID.random();
            const password = new Password('hashedPassword123');
            const email = new Email('test@example.com');

            const account = Account.createWithPassword(id, password, email);

            const primitives = account.toPrimitives();

            expect(primitives.id).toBe(id.value);
            expect(primitives.email).toBe('test@example.com');
            expect(primitives.status).toBe('pending_verification');
        });

        it('should convert verified account to primitives', () => {
            const id = AccountID.random();
            const password = new Password('hashedPassword123');
            const email = new Email('test@example.com');

            const account = Account.createWithPassword(id, password, email);
            account.verify();

            const primitives = account.toPrimitives();

            expect(primitives.status).toBe('active');
        });
    });
});
