export const rooms = {};

export function createRoom(roomId) {
  rooms[roomId] = {
    users: [],
    // 2분 지나도 생성된 방에 유저가 접속하지 않는다면 방 자동삭제하는 타이머의 id 저장
    timeoutId: setTimeout(() => {
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
        console.log(
          `Room ${roomId} has been automatically deleted. 현재 방들: ${rooms}`
        );
      }
    }, 2 * 60 * 1000), // 2분
  };
}

export function addUserToRoom(roomId, userId) {
  rooms[roomId].users.push(userId);
  // 방 자동삭제 타이머 해제
  clearTimeout(rooms[roomId].timeoutId);
}

export function getRoomData(roomId) {
  if (!rooms[roomId]) {
    return {
      exists: false,
    };
  } else {
    return {
      exists: true,
      users: rooms[roomId].users,
    };
  }
}
