import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import { uploadFile } from "../../../helpars/fileUploader";
import { UserController } from "./user.controller";
import { UserRole } from "@prisma/client";
import { parseBodyData } from "../../middlewares/parseNestedJson";

const router = express.Router();

// get all users
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.getAllUsers
);

//get my profile
router.get(
  "/my-profile",
  auth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BUSINESS_PARTNER,
    UserRole.USER
  ),
  UserController.getMyProfile
);

// get user by id
router.get(
  "/:id",
  auth(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.USER,
    UserRole.BUSINESS_PARTNER
  ),
  UserController.getUserById
);

// create role for supper admin
router.post(
  "/",
  auth(UserRole.SUPER_ADMIN),
  validateRequest(userValidation.createUserZodSchema),
  UserController.createRoleSupperAdmin
);

// single update user (info + profile image)
router.patch(
  "/update",
  auth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BUSINESS_PARTNER,
    UserRole.USER
  ),
  uploadFile.profileImage,
  parseBodyData,
  validateRequest(userValidation.updateUserZodSchema),
  UserController.updateUser
);

// delete my account
router.patch(
  "/my-account",
  auth(UserRole.USER, UserRole.BUSINESS_PARTNER),
  UserController.deleteMyAccount
);

export const userRoute = router;
