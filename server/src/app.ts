var app = require('express')();
var server = require('http').createServer(app);

const path = require('path');
const io = require('socket.io')(server);

const chatRooms = {};

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/../index.html'));
});

var chat = io.of('/chat');
chat.on('connection', function (socket) {
  socket.emit('get rooms', Object.keys(chatRooms));

  socket.on('join room', function (data) {
    const name = data.name;
    const room = data.room;
    if (!chatRooms[room]) {
      chatRooms[room] = [];
    }

    socket.join(room);
    socket.name = name;

    socket.to(room).emit(`${name}님이 입장했습니다.`);

    // 채팅방 참여자 목록에 추가
    chatRooms[room].push(name);
  });

  socket.on('chat message', function (data) {
    const name = data.name;
    const room = data.room;
    const msg = data.msg;

    console.log(`message from ${name}: ${msg}`);
    chat.to(room).emit('chat message', msg);
  });
});

//   // force client disconnect from server
//   socket.on('forceDisconnect', function () {
//     socket.disconnect();
//   });

//   socket.on('disconnect', function () {
//     console.log('user disconnected: ' + socket.name);
//   });
// });

module.exports = server;
