import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LeafMaterialModel from "../models/sql/leaf.materials.model";
import { Op } from "sequelize";
import cloudinary from "cloudinary";

export const createleafMateiral = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            drawing_no_id,
            model_name,
            name,
            row_materials,
            comments,
            counts,
            specification,
            root_materials_idroot_materials, // Foreign key to RootMaterials
            drawing_no, // {file: string, fileType: string}
        } = req.body;

        // 验证输入字段
        if (!drawing_no_id || !name || counts === undefined) {
            return next(new ErrorHandler("型号 (drawing_no_id)、名称 (name) 和数量 (counts) 是必填项", 400));
        }

        let drawing_no_public_id = ""
        let drawing_no_secure_url = ""
        if (drawing_no != "" && drawing_no.file) {
            const isPDF = drawing_no.file.includes("application/pdf");
            try {
                const myCloud = await cloudinary.v2.uploader.upload(drawing_no.file, {
                    folder: "drawing_nos",
                    transformation: isPDF
                    ? [
                        { page: "1" }, // 仅提取 PDF 的第一页
                        { quality: "auto", fetch_format: "auto" },
                      ]
                    : [
                        { quality: "auto", fetch_format: "auto" },
                      ],
                });

                drawing_no_public_id = myCloud.public_id;
                drawing_no_secure_url = myCloud.secure_url;
            } catch (uploadError) {
                return next(new ErrorHandler("图片上传失败，请检查文件格式或重试", 500));
            }
        }




        const newLeafMateiral = await LeafMaterialModel.create({
            model_name,
            name,
            row_materials,
            comments,
            counts,
            specification,
            root_materials_idroot_materials,
            drawing_no_id,
            drawing_no_public_id,
            drawing_no_secure_url,
            version: 0
        })

        res.status(201).json({
            success: true,
            message: `添加成功 ${name}`,
            newLeafMateiral
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

export const searchMaterialsById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { drawing_no_id, page = 1, limit = 10 } = req.query;

        const querytConditions: any = {};
        console.log(drawing_no_id)

        if (drawing_no_id) {
            querytConditions.drawing_no_id = {
                [Op.like]: `%${drawing_no_id}%`,
            }
        }

        const materials = await LeafMaterialModel.findAndCountAll({
            where: querytConditions,
            limit: Number(limit),
            offset: (Number(page) - 1) * Number(limit),
        })

        res.status(200).json({
            success: true,
            data: materials.rows,
            totalCount: materials.count,
            currentPage: page,
            totalPages: Math.ceil(materials.count / Number(limit)),
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

export const searchMaterialsByRoot = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            root_materials_idroot_materials,
            searchBy = "name",
            search,
            countsRange,
            page = 1,
            limit = 8,
            order = "ASC",
            sortBy = "name"
        } = req.query;
        

        const queryConditions: any = {};

        // 分类筛选条件
        if (root_materials_idroot_materials) {
            queryConditions.root_materials_idroot_materials = {
                [Op.eq]: root_materials_idroot_materials
            };
        }

        // 搜索条件
        if (searchBy) {
            if (search) {
                const searchByStr = String(searchBy);
                queryConditions[searchByStr] = {
                    [Op.like]: `%${search}%`
                };
            }

            if (searchBy === "counts" && countsRange) {
                const countsRangeStr = String(countsRange);  // 转换为字符串以使用 split 方法

                if (countsRangeStr.includes('-')) {
                    const [minCount, maxCount] = countsRangeStr.split("-");
                    queryConditions.counts = {
                        [Op.between]: [Number(minCount), Number(maxCount)]
                    };
                }
            }
        }

        const offsetValue = (Number(page) - 1) * Number(limit);

        const materials = await LeafMaterialModel.findAndCountAll({
            where: queryConditions,
            order: [[sortBy as string, order as string]],
            limit: Number(limit),
            offset: offsetValue
        });

        const totalPages = Math.ceil(materials.count / Number(limit));

        res.status(200).json({
            success: true,
            data: materials.rows,
            totalCount: materials.count,
            currentPage: Number(page),
            totalPages
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const updateMaterialCounts = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, counts } = req.body;

        // 验证输入
        if (!id || counts === undefined) {
            return next(new ErrorHandler("型号 (drawing_no_id) 和数量 (counts) 是必填项", 400));
        }

        // 查找该材料项
        const material = await LeafMaterialModel.findOne({
            where: { drawing_no_id: id }
        });

        if (!material) {
            return next(new ErrorHandler("未找到该材料", 404));
        }

        // 更新材料的数量
        material.counts = counts;

        // 保存更新
        await material.save();

        res.status(200).json({
            success: true,
            message: `材料数量已更新为 ${counts}`,
            material
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});