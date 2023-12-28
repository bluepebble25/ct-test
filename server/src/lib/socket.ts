import { Server, Socket } from 'socket.io';
import rooms from '../service/rooms';
import { User } from '../service/users';
import { UserMessage, ServerMessage } from '../service/message';

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

  function chatToRoom(event: string, message: UserMessage | ServerMessage) {
    console.log('room에 emit합니다.');
    chat.to(socket.roomId).emit(event, message);
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

      // 유저를 방에 추가
      const newUser = new User(userId, username);
      const room = rooms.getRoom(roomId);
      room.addUser(newUser);

      // 채팅방에 유저의 입장 알림
      const serverMessage = new ServerMessage('userJoin', { userId });
      chatToRoom('message', serverMessage);
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
      const { userId, videoId } = data;
      const roomId = socket.roomId;

      rooms.getRoom(roomId).changeVideoId(videoId);
      const serverMessage = new ServerMessage('newVideo', { userId });
      chatToRoom('message', serverMessage);
      sendVideoEvent('newVideo', { ...data, socketId: socket.id });
    });

    detectEvent('play', (data: VideoEventData['play']) => {
      const { userId } = data;

      const serverMessage = new ServerMessage('play', { userId });
      chatToRoom('message', serverMessage);
      sendVideoEvent('play', { ...data, socketId: socket.id });
    });

    detectEvent('pause', (data: VideoEventData['pause']) => {
      const { userId } = data;

      const serverMessage = new ServerMessage('pause', { userId });
      chatToRoom('message', serverMessage);
      sendVideoEvent('pause', { ...data, socketId: socket.id });
    });

    detectEvent('jump', (data: VideoEventData['jump']) => {
      const { userId, time } = data;
      const serverMessage = new ServerMessage('jump', { userId, time });
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
