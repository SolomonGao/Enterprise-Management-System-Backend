import express from "express";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";
import { purchaseMaterial } from "../controllers/purchasing.controller";

const purchasingRouter = express.Router();

purchasingRouter.put("/purchasing-material", isAutheticated, authorizeRoles("管理"), purchaseMaterial);

export default purchasingRouter;