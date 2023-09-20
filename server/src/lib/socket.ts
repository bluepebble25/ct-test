import { Server, Socket } from 'socket.io';
import server from '../app';
import { addUserToRoom } from '../service/rooms';
import { ServerMessage } from '../types/message';

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
    const { watchJoin, watchMessage } = createSocketHandler(socket);

    watchJoin();
    watchMessage();
  });
}

function createSocketHandler(socket: CustomSocket) {
  function detectEvent(event: string, func) {
    socket.on(event, func);
  }

  function sendToRoom(event, data) {
    const { roomId } = data;
    console.log('room에 emit합니다.');
    chat.to(roomId).emit(event, data);
  }

  const watchJoin = () => {
    detectEvent('join room', (data) => {
      const roomId = (socket.roomId = data.roomId);
      const userId = (socket.userId = data.userId);
      // 나중에 db에서 userId 바탕으로 닉네임 등을 가져오는 로직도 추가하기
      data.message = `${userId} 님이 입장하셨습니다.`;

      socket.join(roomId);
      const serverMessage: ServerMessage = {
        roomId,
        content: data.message,
        isServerMessage: true,
      };

      console.log(`메시지 이벤트 발생: ${JSON.stringify(serverMessage)}`);
      sendToRoom('message', serverMessage);

      // 유저를 방에 추가
      addUserToRoom(roomId, userId);
    });
  };

  const watchMessage = () => {
    detectEvent('message', (data) => {
      console.log('받은 메시지:', data);
      sendToRoom('message', data);
    });
  };

  return {
    watchJoin,
    watchMessage,
  };
}

export { io };
