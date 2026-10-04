import Router from "express";
import { getNearbyInstitutions } from "../controllers/institution.controller.js";

const router = Router();

router.get("/nearby", getNearbyInstitutions);

export default router;
