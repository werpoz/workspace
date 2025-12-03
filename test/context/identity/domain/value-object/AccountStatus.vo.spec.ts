import { AccountStatus, AccountStatusEnum } from 'src/context/identity/domain/value-object/AccountStatus.vo';

describe('AccountStatus', () => {
    it('should create pending_verification status', () => {
        const status = AccountStatus.pendingVerification();
        expect(status.value).toBe(AccountStatusEnum.PENDING_VERIFICATION);
        expect(status.isPendingVerification()).toBe(true);
        expect(status.isActive()).toBe(false);
        expect(status.isSuspended()).toBe(false);
    });

    it('should create active status', () => {
        const status = AccountStatus.active();
        expect(status.value).toBe(AccountStatusEnum.ACTIVE);
        expect(status.isActive()).toBe(true);
        expect(status.isPendingVerification()).toBe(false);
        expect(status.isSuspended()).toBe(false);
    });

    it('should create suspended status', () => {
        const status = AccountStatus.suspended();
        expect(status.value).toBe(AccountStatusEnum.SUSPENDED);
        expect(status.isSuspended()).toBe(true);
        expect(status.isActive()).toBe(false);
        expect(status.isPendingVerification()).toBe(false);
    });

    it('should throw error for invalid status', () => {
        expect(() => new AccountStatus('invalid' as AccountStatusEnum)).toThrow();
    });

    it('should have same value when created with same enum', () => {
        const status1 = AccountStatus.active();
        const status2 = AccountStatus.active();
        expect(status1.value).toBe(status2.value);
    });

    it('should have different values when created with different enums', () => {
        const status1 = AccountStatus.active();
        const status2 = AccountStatus.suspended();
        expect(status1.value).not.toBe(status2.value);
    });
});
