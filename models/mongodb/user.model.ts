require("dotenv").config();
import mongoose, {Document, Model, Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const emailRegexPattern: RegExp = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

export interface IUser extends Document{
    email: string;
    name: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    },
    role: string;
    isVerified: boolean;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
    updatePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required : [true, "请输入你的姓名"],
    },
    email: {
        type: String,
        required: [true, "请输入你的邮件"],
        validate: {
            validator: function(value: string) {
                return emailRegexPattern.test(value);
            }
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, "请输入你的密码"],
        minlength: [6, "密码长度必须大于6位数"],
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "员工",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true}
)

//sign access token
UserSchema.methods.SignAccessToken = function() {
    return jwt.sign({id: this._id}, process.env.ACCESS_TOKEN || "", {
        expiresIn: "5m",
    })
}

//sign refresh token
UserSchema.methods.SignRefreshToken = function() {
    return jwt.sign({id: this._id}, process.env.REFRESH_TOKEN || "", {
        expiresIn: "5m",
    })
}

//Hash password
UserSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

//compare password
UserSchema.methods.comparePassword = async function(enteredPassword:string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};



const UserModel: Model<IUser> = mongoose.model("User", UserSchema);

export default UserModel;

