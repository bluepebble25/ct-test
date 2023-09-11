import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const chatRooms = {};

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/../index.html'));
});

// var chat = io.of('/chat');
// chat.on('connection', function (socket) {
//   socket.emit('get rooms', Object.keys(chatRooms));

//   socket.on('join room', function (data) {
//     const name = (socket.name = data.name);
//     const room = (socket.room = data.room);
//     if (!chatRooms[room]) {
//       chatRooms[room] = [];
//     }

//     socket.join(room);

//     socket.to(room).emit(`${name}님이 입장했습니다.`);

//     // 채팅방 참여자 목록에 추가
//     chatRooms[room].push(name);
//   });

//   socket.on('chat message', function (data) {
//     const name = data.name;
//     const room = data.room;
//     const msg = data.msg;

//     console.log(`message from ${name}: ${msg}`);
//     chat.to(room).emit('chat message', msg);
//   });

//   socket.on('disconnect', function () {
//     const name = socket.name;
//     const room = socket.room;

//     chatRooms[room] = chatRooms[room].filter((user) => user !== name);

//     if (chatRooms[room].length === 0) {
//       delete chatRooms[room];
//     }
//   });
// });

export default server;
