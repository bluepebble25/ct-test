export interface Message {
  roomId: string;
  user: {
    userId: string;
  };
  content: string;
}

export interface ServerMessage extends Omit<Message, 'user'> {
  isServerMessage: boolean;
}
