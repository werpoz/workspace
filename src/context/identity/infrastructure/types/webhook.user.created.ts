/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
export interface ClerkUserCreatedEvent {
  object: 'event';
  type: 'user.created';
  timestamp: number;
  instance_id: string;
  data: ClerkUserData;
  event_attributes: {
    http_request: {
      client_ip: string;
      user_agent: string;
    };
  };
}

export interface ClerkUserData {
  object: 'user';
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email_addresses: ClerkEmailAddress[];
  enterprise_accounts: any[];
  external_accounts: any[];
  external_id: string | null;
  has_image: boolean;
  image_url: string;
  profile_image_url: string;
  phone_numbers: any[];
  web3_wallets: any[];
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  password_enabled: boolean;
  totp_enabled: boolean;
  two_factor_enabled: boolean;
  backup_code_enabled: boolean;
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  mfa_disabled_at: number | null;
  mfa_enabled_at: number | null;
  last_sign_in_at: number | null;
  last_active_at: number | null;
  legal_accepted_at: number | null;
  locale: string | null;
  create_organization_enabled: boolean;
  delete_self_enabled: boolean;
  private_metadata: Record<string, any>;
  public_metadata: Record<string, any>;
  unsafe_metadata: Record<string, any>;
  saml_accounts: any[];
  passkeys: any[];
  verification_attempts_remaining: number;
  updated_at: number;
  created_at: number;
}

export interface ClerkEmailAddress {
  object: 'email_address';
  id: string;
  email_address: string;
  linked_to: any[];
  matches_sso_connection: boolean;
  reserved: boolean;
  created_at: number;
  updated_at: number;
  verification: {
    object: 'verification_admin' | string;
    status: 'verified' | 'unverified' | string;
    strategy: 'admin' | string;
    attempts: number | null;
    expire_at: number | null;
  };
}
