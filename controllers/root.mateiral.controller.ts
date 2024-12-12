import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import RootMaterialModel from "../models/sql/root.mateiral.model";


export const createRootMateiral = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rootName } = req.body;
        if (!rootName) {
            return next(new ErrorHandler("请填写类名", 400));
        }
        const newRootMateiral = await RootMaterialModel.create({
            root_name: rootName,
            version: 0
        })

        res.status(201).json({
            success: true,
            message: `添加成功${rootName}`,
            newRootMateiral
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

export const getAllRoot = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await RootMaterialModel.findAll({
          });

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})