export class User {
  userId: string; // socket.id
  username: string;

  constructor(userId: string, username: string) {
    this.userId = userId;
    this.username = username;
  }
}
