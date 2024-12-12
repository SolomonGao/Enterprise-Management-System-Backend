import { Request } from "express";
import { IUser } from "../models/mongodb/user.model";

// 自定义req的参数 用于直接使用req.user
declare global {
    namespace Express{
        interface Request {
            user?:IUser;
        }
    }
}