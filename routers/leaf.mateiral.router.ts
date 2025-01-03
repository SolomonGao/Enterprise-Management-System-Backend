import express from "express";
import { createleafMateiral, searchMaterialsById, searchMaterialsByRoot, updateMaterialCounts } from "../controllers/leaf.mateiral.controller";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";


const leafMateiralRouter = express.Router();

leafMateiralRouter.post("/add-material", isAutheticated, authorizeRoles("管理"), createleafMateiral);
leafMateiralRouter.get("/search", searchMaterialsById);

leafMateiralRouter.get("/get-materials-by-root", isAutheticated, searchMaterialsByRoot);
leafMateiralRouter.patch("/update-material-counts", isAutheticated, authorizeRoles("管理"), updateMaterialCounts); // 使用 PATCH 方法更新数量

export default leafMateiralRouter;