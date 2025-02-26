import express from "express";
import { createLog, getLogs } from "../controllers/log.controller";
import { authorizeRoles, isAutheticated } from "../middlewares/auth";

const router = express.Router();

router.post(
    "/create",
    isAutheticated,
    createLog
);

router.get(
    "/get-logs",
    isAutheticated,
    getLogs
);

export default router;