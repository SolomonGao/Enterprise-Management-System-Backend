import mongoose, { Model, Document, Schema, Date } from "mongoose";

type Material = {
    name: string;
    drawing_no_id: string;
    purchasedQuantity: number;
}

const PurchasedMaterialSchema: Schema<Material> = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    drawing_no_id: {
        type: String,
        required: true
    },
    purchasedQuantity: {
        type: Number,
        required: [true, "请输入采购数量"]
    },
},{_id: false});

export interface IPurchasing extends Document {
    material: Material;
    authorizer: string;
    orderDeadline: string;
    status: string;
    operator: string;
}

const PurchasingSchema: Schema<IPurchasing> = new mongoose.Schema({
    material: {
        type: PurchasedMaterialSchema,
        required: [true, "请输入采购产品"],
    },
    authorizer: {
        type: String,
    },
    orderDeadline: {
        type: String,
    },
    status:{
        type: String,
        default: "初始",
    },
    operator: {
        type: String,
        default: "",
    }

}, {timestamps: true})

const PurchasingModel: Model<IPurchasing> = mongoose.model("Purchasing", PurchasingSchema);

export default PurchasingModel;