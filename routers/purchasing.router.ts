import express from "express";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";
import { finishPurchasingMaterial, getAllPurchasing, purchaseMaterial, purchasingMaterial } from "../controllers/purchasing.controller";

const purchasingRouter = express.Router();

purchasingRouter.post("/purchasing-material", isAutheticated, authorizeRoles("管理"), purchaseMaterial);

purchasingRouter.get("/get-all-purchasings", isAutheticated, authorizeRoles("管理", "采购"), getAllPurchasing);

purchasingRouter.post("/start-purchasing-material", isAutheticated, authorizeRoles("管理", "采购"), purchasingMaterial);

purchasingRouter.post("/finish-purchasing-material", isAutheticated, authorizeRoles("管理", "采购"), finishPurchasingMaterial);


export default purchasingRouter;