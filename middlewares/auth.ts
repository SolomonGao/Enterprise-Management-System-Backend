import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis"


// 验证用户是否登录
export const isAutheticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    // 获取cookie
    const access_token = req.cookies.access_token;
    
    if (!access_token) {
        return next(new ErrorHandler("请登录以继续", 400));
    }

    //验证cookies是否一致
    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;

    if (!decoded) {
        return next(new ErrorHandler("错误验证码", 400));
    }


    //获取session
    const allKeys = await redis.keys(`session:${decoded.id}:*`);

    let userInfo: string | null = null;

    for (const key of allKeys) {
        const user = await redis.get(key)

        if (user) {
            userInfo = user;
            break;  // 找到用户信息后，终止循环
        }
    }


    if (!userInfo) {
        // res.cookie("access_token", "", { maxAge: 1 });
        // res.cookie("refresh_token", "", { maxAge: 1 });
        return next(new ErrorHandler("用户不存在", 400));
    }

    // const loggedUser = JSON.parse(user);
    // if (loggedUser.__v)

    //把用户信息放入req头中
    req.user = JSON.parse(userInfo);
    next();
})

// 验证用户是否有资格使用某种功能
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(new ErrorHandler(`${req.user?.role}没有权限执行此操作`, 403))
        }
        next();
    }
}