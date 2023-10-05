import { User } from './users';

class Room {
  roomId: string;
  users: User[];
  timeoutId: NodeJS.Timeout | null;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.users = [];
    this.timeoutId = null;

    this.timeoutId = setTimeout(() => {
      if (rooms[roomId].users.length === 0) {
        this.deleteRoom();
      }
    }, 2 * 60 * 1000); // 2분
  }

  addUser(user: User) {
    this.users.push(user);
    // 방 자동삭제 타이머 해제
    clearTimeout(this.timeoutId);
    delete this.timeoutId;
  }

  getUsers() {
    return this.users;
  }

  removeUser(socketId: string) {
    this.users = this.users.filter((user) => user.socketId !== socketId);
    if (this.users.length === 0) {
      this.timeoutId = setTimeout(() => {
        if (rooms[this.roomId].users.length === 0) {
          this.deleteRoom();
        }
      }, 10 * 60 * 1000);
    }
  }

  deleteRoom() {
    delete rooms[this.roomId];
  }
}

export const rooms: Record<string, Room> = {};

export function createRoom(roomId: string) {
  rooms[roomId] = new Room(roomId);
}

export function getRoom(roomId: string) {
  const room = rooms[roomId];
  if (rooms[roomId]) {
    return room;
  } else {
    return null;
  }
}
