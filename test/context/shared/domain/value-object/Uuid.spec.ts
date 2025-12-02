import { Uuid } from 'src/context/shared/domain/value-object/Uuid';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('Uuid', () => {
  it('should create a valid Uuid', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const uuid = new Uuid(id);
    expect(uuid.value).toBe(id);
  });

  it('should throw InvalidArgumentError for invalid Uuid', () => {
    expect(() => new Uuid('invalid-uuid')).toThrow(InvalidArgumentError);
  });

  it('should generate a random Uuid', () => {
    const uuid = Uuid.random();
    expect(uuid).toBeDefined();
    expect(uuid.value).toBeDefined();
  });

  it('should create Uuid from set', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const uuid = Uuid.set(id);
    expect(uuid.value).toBe(id);
  });
});
