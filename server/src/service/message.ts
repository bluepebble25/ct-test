import { User } from './users';

export class Message {
  roomId: string;
  userId: string;
  content: string;

  constructor(roomId: string, user: User, content = '') {
    this.roomId = roomId;
    this.userId = user.userId;
    this.content = content;
  }
}

type EventType = 'join' | 'leave' | 'play' | 'pause' | 'jump' | 'newVideo';

interface ServerMessageOpts {
  userId?: string;
  time?: string;
}

export class ServerMessage {
  roomId: string;
  content: string;

  constructor(roomId: string, eventType: EventType, opts: ServerMessageOpts) {
    this.roomId = roomId;
    this.content = this.generateServerMessage(eventType, opts);
  }

  generateServerMessage(eventType: string, opts: ServerMessageOpts) {
    let content = '';
    const { userId, time } = opts;

    switch (eventType) {
      case 'join':
        content = `${userId}가 입장했습니다.`;
        break;
      case 'leave':
        content = `${userId}가 떠났습니다.`;
        break;
      case 'play':
        content = `${userId}가 영상을 재생했습니다.`;
        break;
      case 'pause':
        content = `${userId}가 영상을 멈췄습니다`;
        break;
      case 'jump':
        content = `${userId}가 ${time}구간으로 점프했습니다.`;
        break;
      case 'newVideo':
        content = `${userId}가 새 비디오를 재생했습니다`;
        break;
    }

    return content;
  }
}
