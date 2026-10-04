import { Router } from 'express';
import { updateUser, deleteUser } from '../controllers/user.controller.js';

const router = Router();

router.patch('/', updateUser);
router.delete('/', deleteUser);

export default router;