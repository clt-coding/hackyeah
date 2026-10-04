import Router from "express";

import {
  createDaycare,
  getDaycares,
  getDaycare,
  updateDaycare,
  deleteDaycare,
} from '../controllers/daycare.controller.js';

const router = Router();

router.post('/', createDaycare);
router.get('/', getDaycares);
router.get('/:id', getDaycare);
router.patch('/:id', updateDaycare);
router.delete('/:id', deleteDaycare);

export default router;