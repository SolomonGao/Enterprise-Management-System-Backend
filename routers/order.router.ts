import express from "express";
import { changeStatus, createOrder, getAllOrders, getOrderInfo } from "../controllers/order.controller";

const orderRouter = express.Router();

orderRouter.post("/addOrder", createOrder);
orderRouter.put("/changeStatus/:id", changeStatus);
orderRouter.get("/getOrderInfo/:id", getOrderInfo);
orderRouter.get("/all", getAllOrders);

export default orderRouter;