import express from 'express';
import { getInitiatorsController } from '../controllers/initiators.controller';

const router = express.Router();

router.get('/initiators', getInitiatorsController.getInitiators);

export default router;
