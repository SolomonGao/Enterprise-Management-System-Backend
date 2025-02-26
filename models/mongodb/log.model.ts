import mongoose, { Document, Schema } from "mongoose";

export enum LogAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    STATUS_CHANGE = "STATUS_CHANGE"
}

export enum LogTargetType {
    ORDER = "ORDER",
    PRODUCT = "PRODUCT",
    MATERIAL = "MATERIAL",
    USER = "USER",
    PURCHASING = "PURCHASING"
}

export interface ILog extends Document {
    action: LogAction;
    targetType: LogTargetType;
    targetId: string;
    details: string;
    oldData?: any;
    newData?: any;
    userId: string;
    username: string;
    role: string;
    createdAt: Date;
}

const logSchema = new Schema<ILog>({
    action: {
        type: String,
        enum: Object.values(LogAction),
        required: true
    },
    targetType: {
        type: String,
        enum: Object.values(LogTargetType),
        required: true
    },
    targetId: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    oldData: {
        type: Schema.Types.Mixed
    },
    newData: {
        type: Schema.Types.Mixed
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const LogModel = mongoose.model<ILog>("Log", logSchema);

export default LogModel; 