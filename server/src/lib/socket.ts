import { Server, Socket } from 'socket.io';
import server from '../app';
import { addUserToRoom } from '../service/rooms';

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
    const { watchJoin } = createSocketHandler(socket);

    watchJoin();
  });
}

function createSocketHandler(socket: CustomSocket) {
  function detectEvent(event: string, func) {
    socket.on(event, func);
  }

  function sendToUser(event, data) {
    console.log(`데이터를 전송: ${data}`);
    chat.emit(event, data);
  }

  function sendToRoom(event, data) {
    console.log('room에 emit합니다.');
    const { roomId } = data;
    chat.to(roomId).emit(event, data.message);
  }

  const watchJoin = () => {
    detectEvent('join room', (data) => {
      const roomId = (socket.roomId = data.roomId);
      const userId = (socket.userId = data.userId);
      // 나중에 db에서 userId 바탕으로 닉네임 등을 가져오는 로직도 추가하기

      socket.join(roomId);

      data.message = `${userId} 님이 입장하셨습니다.`;
      console.log(`메시지 이벤트 발생: ${data.message}`);
      sendToRoom('message', data);

      // 유저를 방에 추가
      addUserToRoom(roomId, userId);
    });
  };

  return {
    watchJoin,
  };
}

export { io };
