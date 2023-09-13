import express from 'express';
const router = express.Router();
import * as ctrl from '../controller/rooms.ctrl';

router.post('/', ctrl.createRoomController);

export { router };
