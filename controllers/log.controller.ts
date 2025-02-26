import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LogModel from "../models/mongodb/log.model";

export const createLog = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const logData = req.body;

        const log = await LogModel.create(logData);

        res.status(201).json({
            success: true,
            log
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const getLogs = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            searchBy = "targetId",
            exactId,
            targetType,
            startDate,
            endDate,
            userId
        } = req.query;

        const pageNumber = Math.max(1, parseInt(page as string));
        const pageSize = Math.max(1, parseInt(limit as string));
        const skip = (pageNumber - 1) * pageSize;

        const query: any = {};

        if (exactId) {
            query._id = exactId;
        } else if (search) {
            const allowedSearchFields = ["targetId", "username", "details", "role"];
            const searchField = allowedSearchFields.includes(searchBy as string) ? searchBy : "targetId";
            query[searchField as string] = { $regex: search, $options: "i" };
        } else {
            const allowedSearchFields = ["targetId", "username", "details", "role"];
            const searchField = allowedSearchFields.includes(searchBy as string) ? searchBy : "targetId";
            query[searchField as string] = { $regex: search, $options: "i" };
        }

        if (targetType) query.targetType = targetType;
        if (userId) query.userId = userId;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) query.createdAt.$lte = new Date(endDate as string);
        }

        const totalLogs = await LogModel.countDocuments(query);
        const data = await LogModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        const totalPages = Math.ceil(totalLogs / pageSize);

        res.status(200).json({
            success: true,
            data,
            currentPage: pageNumber,
            totalPages,
            totalLogs
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
}); 