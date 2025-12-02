import { Identity } from 'src/context/identity/domain/Identity';
import { IdentityID } from 'src/context/identity/domain/value-object/IdentityID.vo';
import { AccountID } from 'src/context/identity/domain/value-object/AccountID.vo';

describe('Identity', () => {
  it('should create an identity', () => {
    const id = new IdentityID('550e8400-e29b-41d4-a716-446655440001');
    const accountId = new AccountID('550e8400-e29b-41d4-a716-446655440002');

    const identity = Identity.create(id, accountId);

    expect(identity.id).toBe(id);
    expect(identity.accountId).toBe(accountId);
  });

  it('should create from primitives', () => {
    const id = new IdentityID('550e8400-e29b-41d4-a716-446655440001');
    const accountId = new AccountID('550e8400-e29b-41d4-a716-446655440002');

    const identity = Identity.fromPrimitives({
      id: id.value,
      accountId: accountId.value,
    });

    expect(identity.id.value).toBe(id.value);
    expect(identity.accountId.value).toBe(accountId.value);
  });

  it('should convert to primitives', () => {
    const id = new IdentityID('550e8400-e29b-41d4-a716-446655440001');
    const accountId = new AccountID('550e8400-e29b-41d4-a716-446655440002');

    const identity = Identity.create(id, accountId);
    const primitives = identity.toPrimitives();

    expect(primitives).toEqual({
      id: id.value,
      accountId: accountId.value,
    });
  });
});
