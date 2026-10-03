import Router from "express";

import {
  createNanny,
  getNannies,
  getNanny,
  updateNanny,
  deleteNanny,
} from '../controllers/nanny.controller.js';

const router = Router();

router.post('/', createNanny);
router.get('/', getNannies);
router.get('/:id', getNanny);
router.patch('/:id', updateNanny);
router.delete('/:id', deleteNanny);

export default router;

    