import { Router } from 'express';
import { getMe, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = Router();

router.get('/me', getMe);
router.patch('/', updateUser);
router.delete('/', deleteUser);

export default router;