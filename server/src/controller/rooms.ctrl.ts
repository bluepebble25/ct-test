import { createRoom, getRoom } from '../service/rooms';

// controllers
export const getRoomDataController = (req, res) => {
  const { roomId } = req.params;
  const room = getRoom(roomId);
  if (room) {
    const { timeoutId, ...roomData } = room;
    res.json(roomData);
  } else {
    res.status(404).end();
  }
};

export const createRoomController = (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 8);
  createRoom(roomId);
  res.status(201).json({ roomId });
};
