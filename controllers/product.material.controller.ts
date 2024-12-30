import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LeafMaterialModel from "../models/sql/leaf.materials.model";
import { Op } from "sequelize";
import ProductMaterialModel from "../models/sql/produict.material.model";

export const linkMaterialToProduct = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { idProduct, selectedMaterialsId } = req.body;

        if (!Array.isArray(selectedMaterialsId) || selectedMaterialsId.length === 0) {
            return next(new ErrorHandler("所选材料列表不能为空", 400));
        }

        const linkedMaterials = [];
        const errors = [];

        for (const material of selectedMaterialsId) {
            const { id, quantity } = material;

            // 检查是否已经链接
            const [link, created] = await ProductMaterialModel.findOrCreate({
                where: {
                    products_idproduct: idProduct,
                    leaf_materials_drawing_no: id,
                },
                defaults: {
                    material_counts: quantity,
                },
            }); if (created) {
                linkedMaterials.push(link);
            } else {
                errors.push(`材料 ID ${id} 已经链接过`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "部分材料未能成功链接",
                errors,
                linkedMaterials,
            });
        }

        res.status(201).json({
            success: true,
            message: "所有材料成功链接到产品",
            linkedMaterials,
        });


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

export const getMaterialsByProduct = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            idProduct,
            page = 1,
            limit = 5, } = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        if (!idProduct) {
            return next(new ErrorHandler("Product ID is required", 400)); // 如果没有提供产品 ID，则返回错误
        }

        // 查询与该产品 ID 相关的所有原料数据
        const { rows: materials, count } = await ProductMaterialModel.findAndCountAll({
            where: {
                products_idproduct: idProduct, // 过滤条件，匹配传入的产品 ID
            },
            offset,
            limit: Number(limit),
            attributes: [
                "leaf_materials_drawing_no", // 获取材料的图号
                "material_counts", // 获取材料的数量
            ],
            include: [
                {
                    model: LeafMaterialModel, // 假设关联了 ProductModel
                    attributes: [
                        "name", // 获取原料名称
                        "counts", // 获取原料数量
                        "specification",
                    ], // 加载产品的名称和泵型号等
                }
            ]
        });

        const totalPages = Math.ceil(count / Number(limit));



        // 如果没有找到相关的材料数据
        if (materials.length === 0) {
            return res.status(404).json({ message: "没有找到该产品对应的零配件数据。" });
        }

        // 返回找到的所有材料数据
        return res.status(200).json({
            success: true,
            data: materials,
            totalPages,
            totalCount: count,
            currentPage: Number(page),
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})