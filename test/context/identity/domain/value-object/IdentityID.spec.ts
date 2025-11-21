import { IdentityID } from 'src/context/identity/domain/value-object/IdentityID';
import { Uuid } from 'src/context/shared/domain/value-object/Uuid';

describe('IdentityID', () => {
    it('should create a valid IdentityID', () => {
        const id = Uuid.random().value;
        const identityId = new IdentityID(id);
        expect(identityId.value).toBe(id);
    });
});
