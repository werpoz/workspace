import { EnumValueObject } from 'src/context/shared/domain/value-object/EnumValueObject';

export type ProviderType = 'email';

export class Provider extends EnumValueObject<ProviderType> {
  constructor(value: ProviderType) {
    super(value, ['email']);
  }

  protected throwErrorForInvalidValue(value: ProviderType): void {
    throw new Error(`El provider "${value}" no es válido`);
  }
}
