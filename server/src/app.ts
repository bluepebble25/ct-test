import express from 'express';
import http from 'http';
import cors from 'cors';
import { initSocket } from './lib/socket';
import { Server } from 'socket.io';
import { router as rooms } from './router/rooms';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

initSocket(io);

app.use(cors());

app.use('/api/rooms', rooms);

export default server;
