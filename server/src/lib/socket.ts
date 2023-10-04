import { Server, Socket } from 'socket.io';
import server from '../app';
import { User } from '../service/users';
import { getRoom } from '../service/rooms';
import { Message, ServerMessage } from '../service/message';

interface CustomSocket extends Socket {
  roomId: string;
  userId: string;
}

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const chat = io.of('/chat');

export function initSocket(io) {
  chat.on('connection', (socket: CustomSocket) => {
    const { watchDisconnect, watchJoin, watchMessage } =
      createSocketHandler(socket);

    watchJoin();
    watchMessage();
    watchDisconnect();
  });
}

function createSocketHandler(socket: CustomSocket) {
  function detectEvent(event: string, func) {
    socket.on(event, func);
  }

  function sendToRoom(event: string, message: Message | ServerMessage) {
    const { roomId } = message;
    console.log('room에 emit합니다.');
    chat.to(roomId).emit(event, message);
  }

  const watchJoin = () => {
    detectEvent('joinRoom', (data) => {
      const roomId = (socket.roomId = data.roomId);
      const userId = (socket.userId = data.userId);
      // 나중에 db에서 userId 바탕으로 닉네임 등을 가져오는 로직도 추가하기

      socket.join(roomId);

      const serverMessage = new ServerMessage(roomId, 'join', { userId });

      console.log(
        `메시지 이벤트 발생: ${JSON.stringify(serverMessage.content)}`
      );
      sendToRoom('message', serverMessage);

      // 유저를 방에 추가
      const newUser = new User(userId, socket.id);
      const room = getRoom(roomId);
      room.addUser(newUser);
    });
  };

  const watchMessage = () => {
    detectEvent('message', (data) => {
      console.log('받은 메시지:', data);
      sendToRoom('message', data);
    });
  };

  const watchDisconnect = () => {
    detectEvent('disconnect', () => {
      const roomId = socket.roomId;
      const userId = socket.userId;

      const room = getRoom(roomId);
      room.removeUser(userId);
    });
  };

  return {
    watchJoin,
    watchMessage,
    watchDisconnect,
  };
}

export { io };
