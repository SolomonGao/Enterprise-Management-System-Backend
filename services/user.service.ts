import { NextFunction, Response } from "express";
import userModel, { IUser } from "../models/mongodb/user.model"
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/ErrorHandler";

export const updatePassword = async (id: string, newPassword: string) => {
    try {
        const user = await userModel.findById(id).select("+password") as IUser;
        user.password = newPassword;

        await user.save();

        return true;
    } catch (error) {
        return false;
    }
}
export const getUserById = async (userId: string, clientId: string, res: Response, next: NextFunction) => {

    //获取session
    const allKeys = await redis.keys(`session:${userId}:*`);

    let userInfo: string | null = null;

    for (const key of allKeys) {
        if (key.includes(clientId)) {
            const user = await redis.get(key)

            if (user) {
                userInfo = user;
            }
        }
    }

    if (userInfo) {
        const user = JSON.parse(userInfo as string);
        
        res.status(201).json({
            success: true,
            user,
        })
    } 
    else {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        res.status(402).json({
            success: false,
            message: "检测到异地登录，现将你登出"
        })
    }
}