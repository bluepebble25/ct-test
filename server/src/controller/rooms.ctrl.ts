import { createRoom, rooms } from '../service/rooms';

// controllers
const createRoomController = (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 8);
  createRoom(roomId);
  console.log('방 생성 완료:', rooms);
  res.json({ roomId });
};

export { createRoomController };
