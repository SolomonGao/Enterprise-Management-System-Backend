import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LeafMaterialModel from "../models/sql/leaf.materials.model";
import { Op } from "sequelize";
import ProductMaterialModel from "../models/sql/produict.material.model";
import productRouter from "../routers/product.Router";

export const linkMaterialToProduct = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {idProduct, material_no, material_counts} = req.body;

        const [link, created] = await ProductMaterialModel.findOrCreate({
            where:{
                products_idproduct: idProduct,
                leaf_materials_drawing_no: material_no,
                material_counts: material_counts
            }
        })

        if (!created) {
            return next(new ErrorHandler("请勿重复添加", 400));
        }

        res.status(201).json({
            success: true,
            link
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})