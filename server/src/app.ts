import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';

import { router as rooms } from './router/rooms';
import { initSocket } from './lib/socket';

const app = express();
const server = http.createServer(app);

app.use(cors());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/../index.html'));
});

app.use('/api/rooms', rooms);

initSocket(server);

export default server;
