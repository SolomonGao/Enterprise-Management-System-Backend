import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";



export const ErrorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || '服务器问题';

    // wrong db id error
    if (err.name === 'CastError') {
        const message = `资源未找到，请重试 : ${err.path}`;
        err = new ErrorHandler(message, 400); 
    };

    // dup key
    if (err.code === 11000) {
        const message = `Duplicate  ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    };

    // wrong jwt error
    if (err.name === 'JsonWebTokenError') {
        const message = `Json token 错误，请重试`;
        err = new ErrorHandler(message, 400);
    };

    // jwt expired error
    if (err.code === "TokenExpiredError") {
        const message = `Json token 过期，请重试`;
        err = new ErrorHandler(message, 400);
    };

    res.status(err.statusCode).json( {
        success: false,
        message: err.message,
    });
}