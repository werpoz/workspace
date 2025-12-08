export class Chat {
  constructor(
    public readonly id: string, // JID
    public readonly name?: string,
    public readonly unreadCount?: number,
    public readonly lastMessageAt?: Date,
  ) {}

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      unreadCount: this.unreadCount,
      lastMessageAt: this.lastMessageAt?.toISOString(),
    };
  }
}
