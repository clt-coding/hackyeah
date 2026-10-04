import Router from "express";
import { getNearbyInstitutions } from "../controllers/institution.controller.js";
import { getInstitutions } from '../controllers/institution.controller.js';

const router = Router();

router.get("/nearby", getNearbyInstitutions);
router.get("/", getInstitutions);

export default router;
