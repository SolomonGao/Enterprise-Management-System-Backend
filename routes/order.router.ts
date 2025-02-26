import express from "express";
import { changeStatus, createOrder, getAllOrders, getRequiredMaterials, useRequiredMaterials, updateOrder, restoreInventory } from "../controllers/order.controller";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";

const orderRouter = express.Router();

orderRouter.post("/add-order", isAutheticated, authorizeRoles("管理"), createOrder);
orderRouter.put("/change-status", isAutheticated, authorizeRoles("管理"), changeStatus);
orderRouter.get("/get-orders", isAutheticated, authorizeRoles("管理"), getAllOrders);
orderRouter.get("/get-required-materials", isAutheticated, authorizeRoles("管理"), getRequiredMaterials);
orderRouter.put("/use-required-materials", isAutheticated, authorizeRoles("管理"), useRequiredMaterials);

// 更新订单信息
orderRouter.put('/update-order', isAutheticated, authorizeRoles("管理"), updateOrder);

// 恢复库存
orderRouter.post('/restore-inventory', isAutheticated, authorizeRoles("管理"), restoreInventory);

export default orderRouter;