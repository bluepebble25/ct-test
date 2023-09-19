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

// interface Message {
//   user: {
//     userId: string;
//     username: string;
//     profile_url: string;
//   };
//   content: string;
//   timestamp: Date;
// }
