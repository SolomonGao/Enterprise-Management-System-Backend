require("dotenv").config();
import { Request, Response, NextFunction, request } from "express";
import userModel, { IUser } from "../models/mongodb/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs, { Template } from "ejs";
import { v4 as uuidv4 } from "uuid";
import sendMail from "../utils/sendMail";
// import { sendToken, accessTokenOptions, refreshTokenOptions } from "../utils/jwt";
import { redis } from "../utils/redis";
import UserModel from "../models/mongodb/user.model";
import { accessTokenOptions, deletePasswordResetToken, generateToken, refreshTokenOptions, savePasswordResetToken, sendToken, verifyPasswordResetToken } from "../utils/jwt";
import cloudinary from "cloudinary";
import { getUserById, updatePassword } from "../services/user.service";
import { Session } from "inspector/promises";


interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registration = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, password } = req.body;

        const isEmailExist = await UserModel.findOne({ email });

        if (isEmailExist) {
            return next(new ErrorHandler("邮箱重复", 400));
        }

        const user: IRegistrationBody = {
            name,
            email,
            password
        }

        if (user.password.length < 6) {
            return next(new ErrorHandler("密码长度小于6", 400));
        }
        const activationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data = { user: { name: user.name }, activationCode };

        //const html = await ejs.renderFile(path.join("../mails/activation-mail.ejs"), data)

        try {
            await sendMail(
                {
                    email: user.email,
                    subject: "激活账户",
                    template: "activation-mail.ejs",
                    data,
                }
            )

            res.status(201).json({
                success: true,
                message: `请检查你的邮箱：${user.email}来激活账户`,
                activationToken: activationToken.token,
            })
        } catch (error: any) {
            next(new ErrorHandler(error.message, 400));
        }


    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
})

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const addRegistratingToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

        const {email} = req.body;

        const expiresIn = 60 * 10;
        redis.set(email, activationCode, "EX", expiresIn)

        res.status(200).json({
            success:true,
            message: `已经允许${email}进行注册，以下是该邮箱的激活码`,
            activationCode
        })


    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
})

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign(
        { user, activationCode },
        process.env.ACTIVATION_SECRET as Secret,
        { expiresIn: "5m", }
    );

    return { token, activationCode };
}

// ACTIVATE USER
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
};

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_code, activation_token } = req.body as IActivationRequest;

        const newUser: { user: IUser, activationCode: string } = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: IUser, activationCode: string };

        if (!newUser) {
            return next(new ErrorHandler("错误请求", 400));
        }

        if (newUser.activationCode != activation_code) {
            return next(new ErrorHandler("错误的激活码", 400));
        }

        const { email, name, password } = newUser.user;

        const existEmail = await userModel.findOne({ email });

        if (existEmail) {
            return next(new ErrorHandler("邮箱已存在", 400));
        }

        const user = await UserModel.create({
            name,
            email,
            password
        })

        res.status(200).json({
            success: true,
            user,
        })

    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
})

// login user
interface ILoginRequest {
    email: string;
    password: string;
    clientId: string;
}


export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, clientId } = req.body as ILoginRequest;

 // 每个客户端都会生成一个唯一标识符。

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400));
        }

        const user = await UserModel.findOne({ email }).select("+password");

        // console.log(user)
        if (!user) {
            return next(new ErrorHandler("Invalid Email or password", 400));
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid password", 400));
        }

        await sendToken(user, clientId, 200, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });

        const userId = req.user?._id || "";

        //获取session
        const allKeys = await redis.keys(`session:${userId}:*`);

        let userInfo: string | null = null;

        for (const key of allKeys) {
            const user = await redis.get(key)

            if (user) {
                redis.del(key as string);
                break;  // 找到用户信息后，终止循环
            }
        }

        res.status(200).json({
            success: true,
            message: "登出成功"
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

export const updateAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;

        const message = "刷新令牌获取失败";

        if (!decoded) {
            return next(new ErrorHandler(message, 400));
        }

        //获取session
        const allKeys = await redis.keys(`session:${decoded.id}:*`);

        let sessionInfo: string | null = null;

        for (const key of allKeys) {
            const session = await redis.get(key)

            if (session) {
                sessionInfo = session;
                break;  // 找到用户信息后，终止循环
            }
        }


        if (!sessionInfo) {
            return next(new ErrorHandler(message, 400));
        }

        const user = JSON.parse(sessionInfo);

        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: "30m",
        })

        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: "7d",
        })

        const expirationTimeInSeconds = 300;

        // // upload session to redis
        // await redis.set(`session:${user._id}:${clientId}`, JSON.stringify(user), "EX", expirationTimeInSeconds);

        req.user = user

        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);


        res.status(200).json({
            success: true,
            accessToken
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

export const resetPassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const isEmailExist = await UserModel.findOne({ email });

    if (!isEmailExist) {
        return next(new ErrorHandler("未找到此邮箱", 400));
    }

    const token = generateToken(email);
    const resetLink = `http://localhost:3000/reset_password/${token}`;
    const data = { user: { name: isEmailExist.name }, resetLink };

    try {
        await sendMail(
            {
                email: email,
                subject: "重置密码",
                template: "reset-password-mail.ejs",
                data,
            }
        )
        try {
            await savePasswordResetToken(token, email);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }


        res.status(201).json({
            success: true,
            message: `请检查邮箱来重置${isEmailExist.name}的密码`,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }

})


export const postResetPassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;

    const { token } = req.query as any;


    if (!token || !password) {
        return next(new ErrorHandler('没有找到密码和令牌', 400));
    }

    // 验证令牌并获取邮箱
    try {
        const email = await verifyPasswordResetToken(token);
        if (!email) {
            await deletePasswordResetToken(token);
            return next(new ErrorHandler('令牌失效，请重试', 400));
        }

        // 更新用户密码
        const user = await userModel.findOne({ email }) as IUser;
        const result = await updatePassword(user._id as string, password)
        if (!result) {
            await deletePasswordResetToken(token);
            return next(new ErrorHandler("出现错误，请重试", 400));
        }

        const access_token = req.cookies.access_token;
        if (access_token) {
            res.cookie("access_token", "", { maxAge: 1 });
            res.cookie("refresh_token", "", { maxAge: 1 });

            const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;

            const user = await redis.get(decoded.id);

            if (user) {
                redis.del(decoded.id);
            }

        }

        // 删除 Redis 中的令牌
        await deletePasswordResetToken(token);
        res.status(200).json({
            success: true,
            message: '更改密码成功'
        });
    } catch (error: any) {
        await deletePasswordResetToken(token);
        return next(new ErrorHandler(error.message, 400));
    }
});


export const updateProfilePicture = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const { avatar } = req.body;
        const userId = req.user?._id;

        const user = await userModel.findById(userId);

        if (avatar && user) {
            if (user?.avatar?.public_id) {
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
            }

            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
            })
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        await user?.save();



        res.status(200).json({
            success: true,
            user
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

interface IUpdateUserInfo {
    email?: string;
    name?: string;
    role?: string;
}

export const updateUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, role } = req.body as IUpdateUserInfo;

        const userId = req.user?._id;

        const user = await UserModel.findById(userId);


        if (name && user) {
            user.name = name;
        }

        if (user && role) {
            user.role = role;
        }

        if (user) {
            user.__v += 1;
        }

        await user?.save();

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
})

export const getgUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id as string;
        const clientId = req.query["clientId"];

        if (clientId !== undefined) {
            getUserById(userId, clientId as string, res, next);
        }
        else {
            res.status(200).json({
                success: false
            })
        }
        
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
})

export const getAllUsers = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, id } = req.query;
        const totalUsers = await userModel.countDocuments() - 1;
        const users = await userModel
            .find({ _id: { $ne: id } })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            totalPages: Math.ceil(totalUsers / Number(limit)),
            data: users,
        });

    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
})

export const updateUserRole = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, newRole } = req.body;

        // 验证新的角色
        const allowedRoles = ['员工', '管理'];
        if (!allowedRoles.includes(newRole)) {
            return next(new ErrorHandler('无效的角色', 400));
        }

        // 查找用户并更新角色
        const user = await userModel.findById(userId);
        if (!user) {
            return next(new ErrorHandler('用户未找到', 404));
        }

        // 更新用户的角色
        user.role = newRole;
        user.__v += 1;
        await user.save();

        // 返回成功响应
        return res.status(200).json({
            message: '用户角色更新成功',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

interface IUpdatePassword {
    oldPassword: string;
    newPassword: String;
}

export const changePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { currentPassword, newPassword } = req.body;

        //const user = req.user as IUser;
        const user = await userModel.findById(req.user?._id).select("+password");

        if (!currentPassword || !newPassword) {
            return next(new ErrorHandler("请输入您的新密码和旧密码", 400));
        }

        if (currentPassword === newPassword) {
            return next(new ErrorHandler("新密码和旧密码一样，请重试", 400));
        }

        if (user?.password === undefined) {
            return next(new ErrorHandler('未检测到用户，请重试', 400));
        }

        const isPasswordMatch = await user?.comparePassword(currentPassword);

        if (!isPasswordMatch) {
            return next(new ErrorHandler("旧密码错误", 400));
        }

        user.password = newPassword;

        await user.save();

        res.status(200).json({
            success: true,
            user,
        });



    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
}) 