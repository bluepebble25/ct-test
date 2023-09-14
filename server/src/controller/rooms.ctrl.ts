import { createRoom, getRoomData, rooms } from '../service/rooms';

// controllers
export const getRoomDataController = (req, res) => {
  const { roomId } = req.params;
  const roomData = getRoomData(roomId);
  if (roomData.exists) {
    res.json(roomData);
  } else {
    res.status(404).json(roomData);
  }
};

export const createRoomController = (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 8);
  createRoom(roomId);
  console.log('방 생성 완료:', rooms);
  res.json({ roomId });
};
