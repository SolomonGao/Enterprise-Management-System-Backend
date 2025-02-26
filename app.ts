import express, { Request, Response, NextFunction } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middlewares/error";
import userRouter from "./routes/user.Router";
import productRouter from "./routes/product.Router";
import leafMateiralRouter from "./routes/leaf.mateiral.router";
import rootMateiralRouter from "./routes/root.mateiral.router";
import orderRouter from "./routes/order.router";
import purchasingRouter from "./routes/purchasing.router";
import logRouter from "./routes/log.router";

const fs = require('fs'); // 引入 fs 模块
const path = require('path'); // 引入 path 模块，便于处理文件路径

require('dotenv').config();


app.use(express.json({limit: '50mb'}));
app.use(cookieParser());


app.set('trust proxy', true); // 如果部署在代理服务器后需要这行

// 全局访问日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  const currentDate = new Date().toISOString();
  const origin = req.headers.origin || 'none';
  const ip = req.ip; // 会自动处理代理情况
  
  // 从 headers 中获取更多信息（可选）
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  const logMessage = `${currentDate} - IP: ${ip} - Origin: ${origin} - UA: ${userAgent}\n`;

  fs.appendFile(path.join(__dirname, 'access_log.txt'), logMessage, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
  
  next();
});


// 只允许前端域名访问
const allowedOrigins = process.env.ORIGIN ? process.env.ORIGIN.split(",") : [];

app.use(cors({
  origin: (origin, callback) => {
    console.log('Request Origin:', origin);  // 打印出请求的 origin
    const currentDate = new Date().toISOString();  // 获取当前日期时间
    const logMessage = `${currentDate} - Origin: ${origin}\n`;

    if (!origin) {
      // 如果没有设置允许的源，拒绝所有跨域请求
      callback(new Error('Not allowed by CORS'));
    }
    else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
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
app.use("/api/v1/log", logRouter);



app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
}) 


app.use(ErrorMiddleware);

