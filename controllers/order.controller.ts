import { NextFunction, query, Request, Response } from "express";
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
    price: number;
}

type Product = {
    id: string;
    quantity: number;
};

type Products = {
    products: Product[];
}

export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 解构请求体
        const { order, selectedProductsId }: { order: IOrderBody; selectedProductsId: Products } = req.body;

        // 验证必填字段
        if (!order || !selectedProductsId || !selectedProductsId.products.length) {
            return next(new ErrorHandler("订单信息或产品列表不能为空", 400));
        }

        const { comments, customer, address, phoneNumber, deadline, price } = order;
        const { products } = selectedProductsId;

        // 收集所有产品 ID 和数量
        const productQuantities = products.reduce((acc, product) => {
            if (product.id && product.quantity > 0) {
              acc[product.id] = product.quantity;
            }
            return acc;
          }, {} as Record<string, number>);

        // 验证产品字段
        if (products.some(product => !product.id || product.quantity <= 0)) {
            return next(new ErrorHandler("产品信息不完整或数量无效", 400));
        }

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
                });
            }

            const materialData = materialMap.get(materialId);
            materialData.requiredQuantity += productMaterial.material_counts * productQuantity;
        }

        // 转换 Map 为数组
        const requiredMaterials = Array.from(materialMap.values());

        // 创建订单，并存储零配件需求
        const newOrder = await OrderModel.create({
            products,
            comments,
            customer,
            address,
            phoneNumber,
            deadline,
            price,
            requiredMaterials, // 存储零配件需求
        });

        // 返回响应
        res.status(201).json({
            success: true,
            newOrder,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "服务器错误", 500));
    }
});




export const getAllOrders = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            limit = 5,
            search,
            searchBy = "_id",
            exactId,
            order = "ASC",
            sortBy = "_id",
        } = req.query;

        const query: any = {};  

        if (exactId) {
            // 精确匹配 _id
            query._id = exactId;
        } else if (search) {
            // 其他字段使用模糊搜索
            query[searchBy] = { $regex: search, $options: "i" };
        }
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
        const encodedMaterials = req.query.materials;

        const materials = JSON.parse(decodeURIComponent(encodedMaterials as string));

        if (!materials || !Array.isArray(materials)) {
            return next(new ErrorHandler("该订单没有包含产品或者配件", 400));
        }

        // 从数据库中查找匹配的材料
        const materialIds = materials.map((item: any) => item.drawing_no_id);
        const materialDocs = await LeafMaterialModel.findAll({
            where: {
                drawing_no_id: materialIds
            }
        });

        // 如果没有匹配的材料，返回错误
        if (!materialDocs.length) {
            return next(new ErrorHandler("未找到匹配的材料", 400));
        }

        // 将数据库返回的数据与请求中的数量合并
        const requiredMaterials = materials.map((item: any) => {
            const matchedMaterial = materialDocs.find(
                (doc) => doc.drawing_no_id === item.drawing_no_id
            );

            if (!matchedMaterial) {
                return { id: item.id, error: "未找到匹配的材料" };
            }

            return {
                name: matchedMaterial.name,
                drawing_no_id: matchedMaterial.drawing_no_id,
                specification: matchedMaterial.specification,
                requiredQuantity: item.requiredQuantity,
                availableQuantity: matchedMaterial.counts,
                image: matchedMaterial.drawing_no_secure_url,
                purchasing: matchedMaterial.purchasing,
                version: matchedMaterial.version,
            };
        });

        // 返回成功响应
        res.status(200).json({
            success: true,
            data: requiredMaterials,
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

export const updateOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId, orderInfo, version } = req.body;

        const order = await OrderModel.findById(orderId);

        if (!order) {
            return next(new ErrorHandler("没有找到订单", 404));
        }

        // 使用乐观锁检查版本
        if (order.__v !== version) {
            return next(new ErrorHandler("订单已被其他用户修改，请刷新后重试", 409));
        }

        // 更新订单信息
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    ...orderInfo,
                    __v: version + 1
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            order: updatedOrder
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const restoreInventory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId } = req.body;

        const order = await OrderModel.findById(orderId);

        if (!order) {
            return next(new ErrorHandler("没有找到订单", 404));
        }

        // 获取订单中的所有需要恢复的材料
        const materialsToRestore = order.requiredMaterials || [];

        if (materialsToRestore.length === 0) {
            return next(new ErrorHandler("该订单没有需要恢复的材料", 400));
        }

        // 批量更新库存
        await Promise.all(
            materialsToRestore.map(async (material: any) => {
                const { drawing_no_id, requiredQuantity } = material;
                
                // 查找材料并更新库存
                const existingMaterial = await LeafMaterialModel.findOne({
                    where: { drawing_no_id }
                });

                if (existingMaterial) {
                    await LeafMaterialModel.update(
                        {
                            counts: existingMaterial.counts + requiredQuantity
                        },
                        {
                            where: { drawing_no_id }
                        }
                    );
                }
            })
        );

        res.status(200).json({
            success: true,
            message: "库存已成功恢复"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
