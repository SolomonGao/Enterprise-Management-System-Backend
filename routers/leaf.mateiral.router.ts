import express from "express";
import { createleafMateiral, searchMaterialsById, searchMaterialsByRoot } from "../controllers/leaf.mateiral.controller";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";


const leafMateiralRouter = express.Router();

leafMateiralRouter.post("/add-material", isAutheticated, authorizeRoles("管理"), createleafMateiral);
leafMateiralRouter.get("/search", searchMaterialsById);

leafMateiralRouter.get("/get-materials-by-root", isAutheticated, searchMaterialsByRoot);

export default leafMateiralRouter;