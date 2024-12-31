import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel from "../models/mongodb/order.model";
import ProductMaterialModel from "../models/sql/produict.material.model";
import LeafMaterialModel from "../models/sql/leaf.materials.model";

interface IOrderBody {
    comments: string;
    customer: string;
    address: string;
    phoneNumber: string;
    deadline: string;
}

type product = {
    productId: string;
    quantity: number;
}
interface Products {
    products: product[];
}
export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            comments,
            customer,
            address,
            phoneNumber,
            deadline
        } = req.body.order as IOrderBody;

        const { products } = req.body.selectedProductsId as Products;

        const newOrder = await OrderModel.create({
            products,
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


export const getAllOrders = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            limit = 5,
            search,
            searchBy = "id",
            order = "ASC",
            sortBy = "id"
        } = req.query;

        const pageNumber = parseInt(page as string);
        const pageLimit = parseInt(limit as string);

        const skip = (pageNumber - 1) * pageLimit;

        const searchFilter = search ? { [searchBy as any]: { $regex: search, $options: 'i' } } : {};

        const sortOrder = order === 'DESC' ? -1 : 1;  // Sort order: -1 for descending, 1 for ascending
        const sortQuery = { [sortBy as any]: sortOrder };

        const totalOrders = await OrderModel.countDocuments(searchFilter);

        const data = await OrderModel.find(searchFilter)
            .skip(skip)
            .limit(pageLimit)
            .sort(sortQuery as any);

        // Calculate total pages
        const totalPages = Math.ceil(totalOrders / pageLimit);

        res.status(200).json({
            success: true,
            data,
            currentPage: pageNumber,
            totalPages,
            totalOrders

        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const changeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { orderId, newStatus, version } = req.body;

        const order = await OrderModel.findById(orderId);

        if (!order) {
            return next(new ErrorHandler("没有找到订单", 400));
        }

        // 使用 Mongoose 的 `versionKey` 来实现乐观锁
        if (order.__v !== version) {
            return next(new ErrorHandler("订单已经被其他人修改，请重试", 400));
        }
        const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, {
            $set: {
                status: newStatus,
                __v: version + 1
            }
        }, { new: true })

        res.status(201).json({
            success: true,
            updatedOrder
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }

})

export const getRequiredMaterials = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { products } = req.body; // [{ id: '改变vsear', quantity: 2 }, { id: '琐事缠身', quantity: 3 }]

        if (!products || !Array.isArray(products)) {
            return next(new ErrorHandler("该订单没有包含产品", 400));
        }

        // 收集所有产品 ID 和数量
        const productQuantities = products.reduce((acc, product) => {
            acc[product.id] = product.quantity;
            return acc;
        }, {} as Record<string, number>);

        // 一次性查询所有相关产品与配件的关联
        const productMaterials = await ProductMaterialModel.findAll({
            where: { products_idproduct: Object.keys(productQuantities) },
            include: [{ model: LeafMaterialModel, as: 'leafMaterial' }]
        });

        // 使用 Map 聚合配件需求
        const materialMap = new Map<string, any>();

        for (const productMaterial of productMaterials) {
            const material = productMaterial.leafMaterial;

            if (!material) continue;

            const materialId = material.drawing_no_id;
            const productId = productMaterial.products_idproduct;
            const productQuantity = productQuantities[productId] || 0;

            if (!materialMap.has(materialId)) {
                materialMap.set(materialId, {
                    name: material.name,
                    drawingNo: material.drawing_no_id,
                    requiredQuantity: 0,
                    availableQuantity: material.counts,
                });
            }

            const materialData = materialMap.get(materialId);
            materialData.requiredQuantity += productMaterial.material_counts * productQuantity;
        }

        // 转换 Map 为数组
        const data = Array.from(materialMap.values());

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});