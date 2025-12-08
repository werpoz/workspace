export class Contact {
  constructor(
    public readonly id: string, // JID
    public readonly name?: string,
    public readonly pushName?: string,
    public readonly phone?: string,
  ) {}

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      pushName: this.pushName,
      phone: this.phone,
    };
  }
}
