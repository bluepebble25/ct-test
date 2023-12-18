import { Server, Socket } from 'socket.io';
import rooms from '../service/rooms';
import { User } from '../service/users';
import { Message, ServerMessage } from '../service/message';

interface CustomSocket extends Socket {
  roomId: string;
}

type EventType = 'joinRoom' | 'disconnect' | 'message' | VideoEvent;

type VideoEvent = 'newVideo' | 'play' | 'pause' | 'jump';

type VideoEventData = {
  newVideo: { roomId: string; userId: string; videoId: string };
  play: { roomId: string; userId: string };
  pause: { roomId: string; userId: string };
  jump: { roomId: string; userId: string; time: number }; // 시간은 초 단위 - ex) 1:56초 지점은 60 * 1 + 56 =  116
};

export function initSocket(io: Server) {
  const chat = io.of('/chat');
  chat.on('connection', (socket: CustomSocket) => {
    const { watchDisconnect, watchJoin, watchMessage, watchVideoEvents } =
      createSocketHandler(socket, chat);

    watchJoin();
    watchMessage();
    watchDisconnect();
    watchVideoEvents();
  });
}

function createSocketHandler(socket: CustomSocket, chat) {
  function detectEvent(event: EventType, func) {
    socket.on(event, func);
  }

  function chatToRoom(event: string, message: Message | ServerMessage) {
    const { roomId } = message;
    console.log('room에 emit합니다.');
    chat.to(roomId).emit(event, message);
  }

  function sendVideoEvent<T extends VideoEvent>(
    event: T,
    eventData: VideoEventData[T] & { socketId: string }
  ) {
    const { roomId, userId } = eventData;
    console.log(`${userId}가 비디오 이벤트 [${event}] 전송`);
    chat.to(roomId).emit(event, eventData);
  }

  const watchJoin = () => {
    detectEvent('joinRoom', (data) => {
      const { roomId, userId, username } = data;
      socket.join(roomId);
      socket.roomId = roomId;

      const serverMessage = new ServerMessage(roomId, 'join', { userId });

      console.log(
        `메시지 이벤트 발생: ${JSON.stringify(serverMessage.content)}`
      );
      chatToRoom('message', serverMessage);

      // 유저를 방에 추가
      const newUser = new User(userId, username);
      const room = rooms.getRoom(roomId);
      room.addUser(newUser);
    });
  };

  const watchMessage = () => {
    detectEvent('message', (data) => {
      console.log('받은 메시지:', data);
      chatToRoom('message', data);
    });
  };

  const watchDisconnect = () => {
    detectEvent('disconnect', () => {
      const roomId = socket.roomId;
      const userId = socket.id;

      const room = rooms.getRoom(roomId);
      room.removeUser(userId);
    });
  };

  const watchVideoEvents = () => {
    detectEvent('newVideo', (data: VideoEventData['newVideo']) => {
      const { roomId, userId, videoId } = data;
      rooms.getRoom(roomId).changeVideoId(videoId);
      const serverMessage = new ServerMessage(roomId, 'newVideo', { userId });
      chatToRoom('message', serverMessage);
      sendVideoEvent('newVideo', { ...data, socketId: socket.id });
    });

    detectEvent('play', (data: VideoEventData['play']) => {
      const { roomId, userId } = data;

      const serverMessage = new ServerMessage(roomId, 'play', { userId });
      chatToRoom('message', serverMessage);
      sendVideoEvent('play', { ...data, socketId: socket.id });
    });

    detectEvent('pause', (data: VideoEventData['pause']) => {
      const { roomId, userId } = data;

      const serverMessage = new ServerMessage(roomId, 'pause', { userId });
      chatToRoom('message', serverMessage);
      sendVideoEvent('pause', { ...data, socketId: socket.id });
    });

    detectEvent('jump', (data: VideoEventData['jump']) => {
      const { roomId, userId, time } = data;

      const serverMessage = new ServerMessage(roomId, 'jump', { userId, time });
      chatToRoom('message', serverMessage);
      sendVideoEvent('jump', { ...data, socketId: socket.id });
    });
  };

  return {
    watchJoin,
    watchMessage,
    watchDisconnect,
    watchVideoEvents,
  };
}
