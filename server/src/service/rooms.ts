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
  delete rooms[roomId].timeoutId;
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

export function removeUserFromRoom(userId, roomId) {
  try {
    console.log(`삭제 전: ${JSON.stringify(rooms)}`);
    rooms[roomId].users = rooms[roomId].users.filter((user) => user !== userId);
    console.log(`삭제 후: ${JSON.stringify(rooms)}`);
    if (rooms[roomId].users.length === 0) {
      deleteRoom(roomId);
    }
  } catch (e) {
    console.log(
      `에러: ${
        e.message
      }, 삭제 실패 roomId: ${roomId}, 방 현황: ${JSON.stringify(rooms)}`
    );
  }
}

export function deleteRoom(roomId) {
  try {
    if (roomId in rooms) {
      delete rooms[roomId];
      console.log(`방 삭제 결과: ${JSON.stringify(rooms)}`);
    }
  } catch (e) {
    console.log(`에러: ${e.message}`);
  }
}
