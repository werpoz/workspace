import { Injectable } from '@nestjs/common';
import { ContactRepository } from '../../../domain/interface/ContactRepository';
import { Contact } from '../../../domain/Contact';

@Injectable()
export class InMemoryContactRepository implements ContactRepository {
  private store = new Map<string, Contact>();

  async upsertMany(contacts: Contact[]): Promise<void> {
    contacts.forEach((c) => this.store.set(c.id, c));
  }

  async findAll(): Promise<Contact[]> {
    return [...this.store.values()];
  }
}
