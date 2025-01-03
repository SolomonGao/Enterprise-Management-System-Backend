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
            searchBy = "_id",
            order = "ASC",
            sortBy = "_id",
        } = req.query;

        // Parse and validate pagination parameters
        const pageNumber = Math.max(1, parseInt(page as string) || 1); // Ensure page is at least 1
        const pageLimit = Math.max(1, parseInt(limit as string) || 5); // Ensure limit is at least 1
        const skip = (pageNumber - 1) * pageLimit;


        // Validate searchBy and sortBy fields
        const allowedSearchFields = ["_id", "customer", "phoneNumber", "address", "deadline", "status"];
        const allowedSortFields = ["_id", "createdAt", "updatedAt"];
        const searchField = allowedSearchFields.includes(searchBy as string) ? searchBy : "_id";
        const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : "_id";

        // Build search and sort queries
        const searchFilter = search ? { [searchField as any]: { $regex: search, $options: "i" } } : {};
        const sortOrder = order === "DESC" ? -1 : 1;
        const sortQuery = { [sortField as any]: sortOrder };

        // Query database
        const totalOrders = await OrderModel.countDocuments(searchFilter);
        const data = await OrderModel.find(searchFilter)
            .skip(skip)
            .limit(pageLimit)
            .sort(sortQuery as any);

        // Calculate total pages
        const totalPages = Math.ceil(totalOrders / pageLimit);

        // Respond with paginated data
        res.status(200).json({
            success: true,
            data,
            currentPage: pageNumber,
            totalPages,
            totalOrders,
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
        const encodedProducts = req.query.products; // [{ id: '改变vsear', quantity: 2 }, { id: '琐事缠身', quantity: 3 }]

        const products = JSON.parse(decodeURIComponent(encodedProducts as string));

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
                    drawing_no_id: material.drawing_no_id,
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

export const useRequiredMaterials = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { materials } = req.body;

        if (!Array.isArray(materials) || materials.length === 0) {
            return next(new ErrorHandler("没有传入正确的材料信息", 400));
        }

        // Store all insufficient materials for response
        const insufficientMaterials: any[] = [];
        const updates: any[] = [];

        for (const material of materials) {
            const { drawing_no_id, requiredQuantity } = material;

            const foundMaterial = await LeafMaterialModel.findOne({ where: { drawing_no_id: drawing_no_id } });

            if (!foundMaterial) {
                // If material is not found in inventory
                insufficientMaterials.push({
                    drawing_no_id,
                    name: material.drawingNo, // Assuming name is the same as drawingNo for simplicity
                    requiredQuantity,
                    availableQuantity: 0,
                });
                continue;
            }

            const availableQuantity = foundMaterial.counts;

            if (availableQuantity < requiredQuantity) {
                insufficientMaterials.push({
                    drawing_no_id,
                    name: foundMaterial.name,
                    requiredQuantity,
                    availableQuantity,
                });
            } else {
                // Update the material's inventory
                updates.push({
                    id: foundMaterial.drawing_no_id,
                    newCounts: availableQuantity - requiredQuantity,
                });
            }
        }

        if (insufficientMaterials.length > 0) {
            // Return response with insufficient materials
            return res.status(400).json({
                success: false,
                message: "库存不足",
                insufficientMaterials,
            });
        }

        // Batch update the inventory for all sufficient materials
        await Promise.all(
            updates.map(update => 
                LeafMaterialModel.update(
                    { counts: update.newCounts },
                    { where: { drawing_no_id: update.id } }
                )
            )
        );

        res.status(200).json({
            success: true,
            message: "订单配件需求已成功处理",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
