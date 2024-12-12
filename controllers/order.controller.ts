import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel from "../models/mongodb/order.model";

interface IOrderBody {
    productId: string;
    counts: number;
    comments: string;
    customer: string;
    address: string;
    phoneNumber: string;
    deadline: number;
}
export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId,
            counts,
            comments,
            customer,
            address,
            phoneNumber,
            deadline
        } = req.body as IOrderBody;



        const newOrder = await OrderModel.create({
            productId,
            counts,
            comments,
            customer,
            address,
            phoneNumber,
            deadline
        })

        res.status(201).json({
            success: true,
            newOrder
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }

})

export const getOrderInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        const order = await OrderModel.findById(orderId);
        const deadline = await order?.getdeadline()
        const now = Math.ceil(new Date().getTime() / (1000 * 60 * 60 * 24))
        const remaining = deadline as number - now;

        res.status(201).json({
            success: true,
            order,
            remaining
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }

})

export const getAllOrders = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 获取所有订单
        const orders = await OrderModel.find();

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const changeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const orderId = req.params.id;
        const { status, currentVersion } = req.body;

        const order = await OrderModel.findById(orderId);

        if (!order) {
            return next(new ErrorHandler("没有找到订单", 400));
        }

        // 使用 Mongoose 的 `versionKey` 来实现乐观锁
        if (order.__v !== currentVersion) {
            return next(new ErrorHandler("订单已经被其他人修改，请重试", 400));
        }
        const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, {
            $set: {
                status: status,
                __v: currentVersion + 1
            }
        }, {new: true})

        res.status(201).json({
            success: true,
            updatedOrder
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }

})