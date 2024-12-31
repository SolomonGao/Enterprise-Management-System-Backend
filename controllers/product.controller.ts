import { Express, NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ProductModel from "../models/sql/product.model";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { Op } from "sequelize";

export const addProduct = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productInfo, selectedImage } = req.body;

        const { idProduct, modelName, pumpModel, manufacturer, drawingNoId } = productInfo;

        const { file, fileType } = selectedImage;

        const isProductExist = await ProductModel.findByPk(idProduct);

        if (isProductExist) {
            return next(new ErrorHandler("产品已经存在", 400));
        }

        let drawing_no_public_id = ""
        let drawing_no_secure_url = ""
        if (selectedImage != "" && file) {
            const isPDF = selectedImage.file.includes("application/pdf");
            try {
                const myCloud = await cloudinary.v2.uploader.upload(file, {
                    folder: "product_drawing_nos",
                    transformation: isPDF ? [
                        { page: "1" },
                        { quality: "auto", fetch_format: "auto" },
                    ] : [
                        { quality: "auto", fetch_format: "auto" },
                    ]
                });

                drawing_no_public_id = myCloud.public_id;
                drawing_no_secure_url = myCloud.secure_url;
            } catch (error) {
                return next(new ErrorHandler("图片上传失败，请检查文件格式或重试", 500));
            }
        }

        const newProduct = await ProductModel.create({
            idproduct: idProduct,
            model_name: modelName,
            pump_model: pumpModel,
            drawing_no_id: drawingNoId,
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

export const deleteProduct = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
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

export const getProducts = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            limit = 8,
            search,
            searchBy = "idproduct",
            order = "ASC",
            sortBy = "idproduct"
        } = req.query; // 获取分页参数，默认页码为 1，每页显示 6 个

        const queryConditions: any = {};
        // 搜索条件
        if (searchBy) {
            if (search) {
                const searchByStr = String(searchBy);
                queryConditions[searchByStr] = {
                    [Op.like]: `%${search}%`
                };
            }
        }

        const offset = (Number(page) - 1) * Number(limit);

        // 查询产品数据和总数
        const { rows: products, count: totalProducts } = await ProductModel.findAndCountAll({
            where: queryConditions,
            order: [[sortBy as string, order as string]],
            offset,
            limit: Number(limit),
        });

        // 计算总页数
        const totalPages = Math.ceil(totalProducts / Number(limit));

        res.status(200).json({
            success: true,
            data: products,
            totalCount: totalProducts,
            currentPage: Number(page),
            totalPages,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
