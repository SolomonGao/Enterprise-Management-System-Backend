import express from "express";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";
import { getAllPurchasing, purchaseMaterial } from "../controllers/purchasing.controller";

const purchasingRouter = express.Router();

purchasingRouter.post("/purchasing-material", isAutheticated, authorizeRoles("管理"), purchaseMaterial);

purchasingRouter.get("/get-all-purchasings", isAutheticated, authorizeRoles("管理", "采购"), getAllPurchasing);


export default purchasingRouter;