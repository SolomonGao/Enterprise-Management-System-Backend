import { Express, NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import multer from "multer";
import  ProductModel  from "../models/sql/product.model";
import ErrorHandler from "../utils/ErrorHandler";


export const addProduct = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { idProduct, model_name, pumpModel, drawing_no_id, manufacturer} = req.body;


        const isProductExist = await ProductModel.findByPk(idProduct);

        if (isProductExist) {
            return next(new ErrorHandler("产品已经存在", 400));
        }

        const newProduct = await ProductModel.create({
            idproduct: idProduct,
            model_name: model_name,
            pump_model: pumpModel,
            drawing_no_id: drawing_no_id,
            manufacturer: manufacturer,
            drawing_no_public_id,
            drawing_no_secure_url,  // Store the image data as a Blob in the database
            version: 0
        });

        res.status(201).json({
            success: true,
            message: "添加成功",
            newProduct,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

export const deleteProduct = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { idProduct } = req.params;  // 从请求参数中获取产品ID
        console.log(idProduct)

        // 检查产品是否存在
        const product = await ProductModel.findByPk(idProduct);

        if (!product) {
            return next(new ErrorHandler("产品不存在", 404));  // 如果产品不存在，返回404错误
        }

        // 删除产品
        await product.destroy();

        res.status(200).json({
            success: true,
            message: "产品删除成功",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
