import express from "express";
import { createRootMateiral, getAllRoot } from "../controllers/root.mateiral.controller";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";


const rootMateiralRouter = express.Router();
rootMateiralRouter.post("/add-root", isAutheticated, authorizeRoles("管理"),  createRootMateiral);

rootMateiralRouter.get("/get-all-root", getAllRoot)

export default rootMateiralRouter;