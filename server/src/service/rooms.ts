import { User } from './users';

class Room {
  roomId: string;
  users: User[];
  timeoutId: NodeJS.Timeout | null;
  videoId: string | null;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.users = [];
    this.videoId = null;
    this.timeoutId = null;

    this.timeoutId = setTimeout(() => {
      if (rooms[roomId].users.length === 0) {
        this.deleteRoom();
      }
    }, 2 * 60 * 1000); // 2분
  }

  /* user 관련 */
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

  /* 방 관련 */
  deleteRoom() {
    delete rooms[this.roomId];
  }

  /* 비디오 관련 */
  changeVideoId(videoId: string) {
    this.videoId = videoId;
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
