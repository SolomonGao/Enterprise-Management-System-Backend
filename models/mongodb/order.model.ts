import mongoose, { Model, Document, Schema, Date } from "mongoose";


export interface IOrder extends Document {
    productId: string;
    counts: number;
    comments: string;
    customer: string;
    address: string;
    phoneNumber: string;
    status: string;
    deadline: number;
    getdeadline:() => Promise<number>;
    version:number;
}

const OrderSchema: Schema<IOrder> = new mongoose.Schema({
    productId: {
        type: String,
        required : [true, "请选择订单型号"],
    },
    counts: {
        type: Number,
        required : [true, "请输入产品数量"],
    },
    comments: {
        type: String,
    },
    customer: {
        type: String,
        required : [true, "请输入客户公司名"],
    },
    phoneNumber: {
        type: String,
        required : [true, "请输入客户公司联系方式"],
    },
    address: {
        type: String,
        required : [true, "请输入客户公司地址"],
    },
    status: {
        type: String,
        default: "未完成"
    },
    deadline: {
        type: Number,
        required: [true, "请输入天数期限"]
    },
    
}, {timestamps: true, versionKey: "__v"});

OrderSchema.methods.getdeadline = async function(): Promise<number> {
    const remainingMilliseconds = this.createdAt.getTime() ;
    return Math.ceil(remainingMilliseconds / (1000 * 60 * 60 * 24)) + this.deadline;

}

const OrderModel: Model<IOrder> = mongoose.model("Order", OrderSchema);

export default OrderModel;