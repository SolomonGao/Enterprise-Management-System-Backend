import express from "express";
import { changeStatus, createOrder, getAllOrders, getRequiredMaterials, useRequiredMaterials } from "../controllers/order.controller";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";

const orderRouter = express.Router();

orderRouter.post("/add-order", isAutheticated, authorizeRoles("管理"), createOrder);
orderRouter.put("/change-status", isAutheticated, authorizeRoles("管理"), changeStatus);
orderRouter.get("/get-orders", isAutheticated, authorizeRoles("管理"), getAllOrders);
orderRouter.get("/get-required-materials", isAutheticated, authorizeRoles("管理"), getRequiredMaterials);
orderRouter.put("/use-required-materials", isAutheticated, authorizeRoles("管理"), useRequiredMaterials);

export default orderRouter;