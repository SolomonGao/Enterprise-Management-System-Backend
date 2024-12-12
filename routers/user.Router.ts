import express from "express";
import {registration, activateUser, loginUser, resetPassword, postResetPassword, logoutUser, updateAccessToken, getgUserInfo, updateProfilePicture, getAllUsers, updateUserRole, updateUserInfo, changePassword} from "../controllers/user.controller";
import { isAutheticated, authorizeRoles} from "../middlewares/auth";


const userRouter = express.Router();

userRouter.post("/registration", isAutheticated, authorizeRoles("管理"), registration); 1

userRouter.post("/activation", activateUser);

userRouter.post("/login", loginUser);

userRouter.post("/reset-password", resetPassword);

userRouter.post("/post-reset-password", postResetPassword);

userRouter.get("/logout", isAutheticated, logoutUser); 1

userRouter.get("/refresh-token", isAutheticated, updateAccessToken);

userRouter.get("/me",isAutheticated, getgUserInfo);

userRouter.put("/update-profile-picture", isAutheticated, updateProfilePicture); 1

userRouter.get("/all-users", isAutheticated, authorizeRoles("管理"), getAllUsers); 1

userRouter.put("/update-user-role", isAutheticated, authorizeRoles("管理"), updateUserRole); 1

userRouter.put("/edit-profile",  isAutheticated, updateUserInfo);

userRouter.put("/change-password",  isAutheticated, changePassword); 1




export default userRouter;