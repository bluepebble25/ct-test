import express from 'express';
const router = express.Router();
import * as ctrl from '../controller/rooms.ctrl';

router.get('/:roomId', ctrl.getRoomDataController);
router.post('/', ctrl.createRoomController);

export { router };
