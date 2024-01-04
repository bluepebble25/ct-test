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

    // 오류 등으로 인해 방 생성 시 진입한 인원이 없으면 일정 시간 뒤 자동으로 삭제
    this.timeoutId = setTimeout(() => {
      if (rooms[roomId].users.length === 0) {
        rooms.removeRoom(roomId);
      }
    }, 2 * 60 * 1000);
  }

  /* user 관련 */
  addUser(user: User) {
    this.users.push(user);
    // 방 자동삭제 타이머 해제
    clearTimeout(this.timeoutId);
    delete this.timeoutId;
  }

  getUserList() {
    return this.users;
  }

  getUser(userId: string) {
    this.users.find((user) => user.userId === userId);
  }

  removeUser(userId: string) {
    this.users = this.users.filter((user) => user.userId !== userId);

    // 일정한 시간동안 방에 잔류하는 인원이 하나도 없다면 방 삭제
    if (this.users.length === 0) {
      this.timeoutId = setTimeout(() => {
        if (rooms[this.roomId].users.length === 0) {
          rooms.removeRoom(this.roomId);
        }
      }, 10 * 60 * 1000);
    }
  }

  /* 비디오 관련 */
  changeVideoId(videoId: string) {
    this.videoId = videoId;
  }
}

class Rooms {
  rooms: Record<string, Room>;

  constructor() {
    this.rooms = {};
  }

  createRoom(roomId: string) {
    this.rooms[roomId] = new Room(roomId);
  }

  getRoom(roomId: string) {
    const room = this.rooms[roomId];
    return room ? room : null;
  }

  removeRoom(roomId: string) {
    delete this.rooms[roomId];
  }
}

const rooms = new Rooms();

export default rooms;
