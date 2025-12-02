import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';
import { Uuid } from 'src/context/shared/domain/value-object/Uuid';

describe('AccountID', () => {
  it('should create a valid AccountID', () => {
    const id = Uuid.random().value;
    const accountId = new AccountID(id);
    expect(accountId.value).toBe(id);
  });
});
