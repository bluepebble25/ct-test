import { v4 as uuid } from 'uuid';
import { User } from './users';

export class UserMessage {
  id: string;
  type: 'userMessage';
  userId: string;
  username: string;
  text: string;
  timestamp: Number;

  constructor(user: User, text: string) {
    this.id = uuid();
    this.type = 'userMessage';
    this.userId = user.userId;
    this.username = user.username;
    this.text = text;
    this.timestamp = Date.now();
  }
}

type ServerMessageType =
  | 'userJoin'
  | 'userLeft'
  | 'updateUserList'
  | 'newVideo'
  | 'play'
  | 'pause'
  | 'jump';

export class ServerMessage {
  id: string;
  type: ServerMessageType;
  timestamp: Number;
  payload;

  constructor(type: ServerMessageType, payload) {
    this.id = uuid();
    this.type = type;
    this.payload = payload;
    this.timestamp = Date.now();
  }
}
