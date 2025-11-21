import { EnumValueObject } from 'src/context/shared/domain/value-object/EnumValueObject';

export type ProviderType = 'email' | 'google' | 'magic-link' | 'clerk';

export class Provider extends EnumValueObject<ProviderType> {
  constructor(value: ProviderType) {
    super(value, ['email', 'google', 'magic-link', 'clerk']);
  }

  protected throwErrorForInvalidValue(value: ProviderType): void {
    throw new Error(`El provider "${value}" no es válido`);
  }
}
