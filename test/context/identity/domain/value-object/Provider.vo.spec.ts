import { Provider } from 'src/context/identity/domain/value-object/Provider.vo';

describe('Provider', () => {
    it('should create a valid Provider', () => {
        const provider = new Provider('email');
        expect(provider.value).toBe('email');
    });

    it('should throw error for invalid Provider', () => {
        expect(() => new Provider('invalid' as any)).toThrow('El provider "invalid" no es válido');
    });
});
