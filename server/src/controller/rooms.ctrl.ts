import rooms from '../service/rooms';

/* controllers */
export const getRoomDataController = (req, res) => {
  const { roomId } = req.params;
  const room = rooms.getRoom(roomId);
  if (room) {
    const { timeoutId, ...roomData } = room;
    res.json(roomData);
  } else {
    res.status(404).end();
  }
};

export const createRoomController = (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 8);
  rooms.createRoom(roomId);
  res.status(201).json({ roomId });
};
