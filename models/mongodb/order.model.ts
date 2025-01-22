import mongoose, { Model, Document, Schema, Date } from "mongoose";

type Product = {
    id: string;
    quantity: number;
};

type Material = {
    name: string;
    drawing_no_id: string;
    requiredQuantity: number;
}

const RequiredMaterialSchema: Schema<Material> = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    drawing_no_id: {
        type: String,
        required: true,
    },
    requiredQuantity: {
        type: Number,
        required: true
    },
}, { _id: false });

const ProductSchema: Schema<Product> = new mongoose.Schema({
    id: {
        type: String,
        required: [true, "产品 ID 是必填项"],
    },
    quantity: {
        type: Number,
        required: [true, "产品数量是必填项"],
        min: [1, "产品数量必须大于 0"],
    },
}, { _id: false });

export interface IOrder extends Document {
    products: Product[];
    comments: string;
    customer: string;
    address: string;
    phoneNumber: string;
    status: string;
    deadline: string;
    requiredMaterials: Material[]
    getdeadline: () => Promise<number>;
    version: number;
}

const OrderSchema: Schema<IOrder> = new mongoose.Schema({
    products: {
        type: [ProductSchema],
        required: [true, "请选择订单产品"],
    },
    comments: {
        type: String,
    },
    customer: {
        type: String,
        required: [true, "请输入客户公司名"],
    },
    phoneNumber: {
        type: String,
        required: [true, "请输入客户公司联系方式"],
    },
    address: {
        type: String,
        required: [true, "请输入客户公司地址"],
    },
    status: {
        type: String,
        default: "初始",
    },
    deadline: {
        type: String,
        required: [true, "请输入天数期限"],
    },
    requiredMaterials: [RequiredMaterialSchema], // 存储所需的零配件信息

}, { timestamps: true, versionKey: "__v" });

OrderSchema.methods.getdeadline = async function (): Promise<number> {

    return 3;
}

const OrderModel: Model<IOrder> = mongoose.model("Order", OrderSchema);

export default OrderModel;