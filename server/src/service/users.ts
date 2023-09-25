export class User {
  userId: string;
  socketId: string;

  constructor(userId: string, socketId: string) {
    this.userId = userId;
    this.socketId = socketId;
  }
}
