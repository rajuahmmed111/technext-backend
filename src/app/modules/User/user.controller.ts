import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./user.service";
import ApiError from "../../../errors/ApiErrors";
import { pick } from "../../../shared/pick";
import { filterField } from "./user.constant";
import { paginationFields } from "../../../constants/pagination";
import { isValidObjectId } from "../../../utils/validateObjectId";
import { IUploadedFile } from "../../../interfaces/file";

// create user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body;
  const result = await UserService.createUser(userData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "OTP generated and sent to email successfully",
    data: result,
  });
});
// get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, filterField);
  const options = pick(req.query, paginationFields);
  const result = await UserService.getAllUsers(filter, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

// get user by id
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await UserService.getUserById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: { ...user, password: undefined },
  });
});

// update user (info + profile image)
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const data = req.body;
  const file = req.file as IUploadedFile | undefined;

  const result = await UserService.updateUser(userId, data, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

// get my profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;

  const result = await UserService.getMyProfile(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My profile retrieved successfully",
    data: result,
  });
});

// delete my account
const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await UserService.deleteMyAccount(userId);

  // clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My account deleted successfully",
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  getMyProfile,
  deleteMyAccount,
};
