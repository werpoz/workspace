import { Contact } from '../Contact';

export interface ContactRepository {
  upsertMany(contacts: Contact[]): Promise<void>;
  findAll(): Promise<Contact[]>;
}
