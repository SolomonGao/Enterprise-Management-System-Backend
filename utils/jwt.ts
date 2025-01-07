require("dotenv").config();
import { NextFunction, Response } from "express";
import { IUser } from "../models/mongodb/user.model";
import { redis } from "./redis";
import jwt, { Secret } from "jsonwebtoken";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

// parse enviroment variables to integrates with fallback values
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '3600', 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '3600', 10);

export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 3 * 60 * 60),
    maxAge: accessTokenExpire * 3 * 60 * 60,
    httpOnly: true,
    sameSite: 'lax',
    // secure: true,
};

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60),
    maxAge: refreshTokenExpire * 24 * 60 * 60,
    httpOnly: true,
    sameSite: 'lax',
    // secure: true
};

// only set secure to true in production
if (process.env.NODE_ENV === 'production') {
    accessTokenOptions.secure = true;
};


export const sendToken = async (user: IUser, clientId: string, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    const expirationTimeInSeconds = 14400;

    const allKeys = await redis.keys(`session:${user._id}:*`);

    for (const key of allKeys) {
        console.log(key)
        const user = await redis.get(key);

        if (user) {
            redis.del(key)
        }
    }
    // upload session to redis
    await redis.set(`session:${user._id}:${clientId}`, JSON.stringify(user), "EX", expirationTimeInSeconds);


    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken: accessToken,
        clientId: clientId,
    });
};


export const generateToken = (email: string): string => {
    return jwt.sign({ email }, process.env.RESET_PASSWORD_SECRET as Secret, { expiresIn: '30m' });
}

export const savePasswordResetToken = async (token: string, email: string): Promise<void> => {
    const expiresIn = 60 * 10; // Token 有效时间 10 分钟
    const key = `${token}=`;
    await redis.set(key, email, "EX", expiresIn); // 使用 await 等待 set 操作完成
};

export const verifyPasswordResetToken = async (token: string): Promise<string | null> => {
    const key = `${token}=`;

    try {
        const email = await redis.get(key); // 异步获取邮箱

        if (email) {
            return email; // 如果找到邮箱，返回邮箱
        } else {
            return null; // 如果没有找到邮箱，返回 null
        }
    } catch (error) {
        console.error("Error getting email from Redis:", error);
        return null; // 如果发生错误，也返回 null
    }
};

export const deletePasswordResetToken = async (token: string): Promise<void> => {
    const key = `${token}=`;
    await redis.del(key); // 删除键，使用 await 等待操作完成
};