export interface Message {
  roomId: string;
  user: {
    userId: string;
  };
  content: string;
}

export type ServerMessage = Omit<Message, 'user'>;

// interface Message {
//   user: {
//     userId: string;
//     username: string;
//     profile_url: string;
//   };
//   content: string;
//   timestamp: Date;
// }
