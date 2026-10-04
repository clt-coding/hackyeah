import Router from 'express';
import {
  createAddress,
  getAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/address.controller.js';

const router = Router();

router.post('/', createAddress);
router.get('/', getAddresses);
router.get('/:id', getAddress);
router.patch('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;