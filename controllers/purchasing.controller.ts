import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LeafMaterialModel from "../models/sql/leaf.materials.model";
import PurchasingModel from "../models/mongodb/purchasing.model";


export const purchaseMaterial = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id, number, version, orderDeadline} = req.body;

        if (!id || number === undefined) {
            return next(new ErrorHandler("型号和数量有误", 400));
        }

        const material = await LeafMaterialModel.findOne({
            where: {drawing_no_id: id}
        });

        if (!material) {
            return next(new ErrorHandler("未找到该零配件", 400));
        }

        if (material.version !== version) {
            return next(new ErrorHandler("该零配件已经被人修改，请刷新并重试", 400));
        }

        material.purchasing += number;
        material.version += 1;

        await material.save();

        const newPurchasing = {
            material: {
                name: material.name,
                drawing_no_id: id,
                purchasedQuantity: number
            },
            orderDeadline: orderDeadline,
            authorizer: req.user?.name,
            status: "初始",
            operator:"",
        };

        await PurchasingModel.create(newPurchasing);

        res.status(200).json({
            success: true,
            message: '添加采购计划成功',
            newPurchasing,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
}) 

export const getAllPurchasing = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            limit = 5,
            search,
            searchBy = "_id",
            order = "ASC",
            sortBy = "_id",
        } = req.query;

        const pageNumber =  Math.max(1, parseInt(page as string) || 1);
        const pageLimit = Math.max(1, parseInt(limit as string) || 5);
        const skip = (pageNumber - 1) * pageLimit;

        const allowedSearchFields = ["_id", "authorizer", "status" , "operator", ""]
        const allowedSortFields = ["_id", "authorizer", "status", "operator"]

        const searchField = allowedSearchFields.includes(searchBy as string) ? searchBy: "_id";
        const sortField = allowedSortFields.includes(sortBy as string) ? sortBy: "_id";

        const searchFilter = search ? { [searchField as any]: { $regex: search, $options : "i"}} : {};
        const sortOrder = order === "DESC" ? -1 : 1;
        const sortQuery = { [sortField as any]: sortOrder };

        const totalPurchasing = await PurchasingModel.countDocuments(searchFilter);
        const data = await PurchasingModel.find(searchFilter)
            .skip(skip)
            .limit(pageLimit)
            .sort(sortQuery as any);

            const totalPages = Math.ceil(totalPurchasing / pageLimit);

            res.status(200).json( {
                success: true,
                data,
                currentPage: pageNumber,
                totalPages,
                totalPurchasing,
            })
            
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})