import express, { Request, Response, NextFunction } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middlewares/error";
import userRouter from "./routers/user.Router";
import productRouter from "./routers/product.Router";
import leafMateiralRouter from "./routers/leaf.mateiral.router";
import rootMateiralRouter from "./routers/root.mateiral.router";
import orderRouter from "./routers/order.router";
import purchasingRouter from "./routers/purchasing.router";
require('dotenv').config();


app.use(express.json({limit: '50mb'}));
app.use(cookieParser());


// 只允许前端域名访问
const allowedOrigins = process.env.ORIGIN ? process.env.ORIGIN.split(",") : [];

app.use(cors({
  origin: (origin, callback) => {
    console.log('Request Origin:', origin);  // 打印出请求的 origin
    if (!allowedOrigins.length) {
      // 如果没有设置允许的源，拒绝所有跨域请求
      callback(new Error('Not allowed by CORS'));
    }
    else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // 如果需要传递 cookie
}));


app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        sucess: true,
        message: "API is working"
    });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/leaf", leafMateiralRouter);
app.use("/api/v1/root", rootMateiralRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/purchasing", purchasingRouter);



app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
}) 


app.use(ErrorMiddleware);

