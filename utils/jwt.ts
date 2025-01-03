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

export const savePasswordResetToken = (token: string, email: string) => {
    const expiresIn = 60 * 10;
    const key = `${token}=`;
    redis.set(key, email, "EX", expiresIn);
}

export const verifyPasswordResetToken = (token: string): Promise<string | null> => {
    const key = `${token}`;
    const email = redis.get(key); // 获取邮箱
    return email; // 如果 token 无效或过期，将返回 null
};

export const deletePasswordResetToken = (token: string) => {
    const key = `${token}`;
    redis.del(key); // 删除键
};