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
    price: number;
    total_price: number;
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
    },
    price: {
        type: Number,
        require: [true, "请输入采购的配件单价"]
    },
    total_price: {
        type: Number,
        default: 0
    }

}, {timestamps: true})

PurchasingSchema.pre<IPurchasing>("save", function (next) {
    if (this.material && this.price) {
        this.total_price = this.material.purchasedQuantity * this.price;
    }
    next();
});

const PurchasingModel: Model<IPurchasing> = mongoose.model("Purchasing", PurchasingSchema);

export default PurchasingModel;