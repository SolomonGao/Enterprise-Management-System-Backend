import express from "express";
import {registration, activateUser, loginUser, resetPassword, postResetPassword, logoutUser, updateAccessToken, getgUserInfo, updateProfilePicture, getAllUsers, updateUserRole, updateUserInfo, changePassword, addRegistratingToken, verifyResetPasswordToken} from "../controllers/user.controller";
import { isAutheticated, authorizeRoles} from "../middlewares/auth";


const userRouter = express.Router();

userRouter.post("/registration", registration); 

userRouter.post("/add-registrating-token", addRegistratingToken);

userRouter.post("/activation", activateUser);

userRouter.post("/login", loginUser);

userRouter.post("/reset-password", resetPassword);

userRouter.get('/verify-reset-password-token', verifyResetPasswordToken);

userRouter.post("/post-reset-password", postResetPassword);

userRouter.get("/logout", isAutheticated, logoutUser); 

userRouter.get("/refresh-token", isAutheticated, updateAccessToken);

userRouter.get("/me",isAutheticated, getgUserInfo);

userRouter.put("/update-profile-picture", isAutheticated, updateProfilePicture); 

userRouter.get("/all-users", isAutheticated, authorizeRoles("管理"), getAllUsers); 

userRouter.put("/update-user-role", isAutheticated, authorizeRoles("管理"), updateUserRole); 

userRouter.put("/edit-profile",  isAutheticated, updateUserInfo);

userRouter.put("/change-password",  isAutheticated, changePassword); 





export default userRouter;