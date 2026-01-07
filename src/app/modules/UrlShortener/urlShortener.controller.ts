import { Request, Response } from "express";
import { UrlShortenerService } from "./urlShortener.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";

// create short URL
const createShortUrl = catchAsync(async (req: Request, res: Response) => {
  const { originalUrl } = req.body;
  const userId = req.user?.id;

  const result = await UrlShortenerService.createShortUrl(originalUrl, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "URL shortened successfully",
    data: result,
  });
});

// get user URLs
const getUserUrls = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "User authentication required",
      data: null,
    });
  }

  const result = await UrlShortenerService.getUserUrls(userId, page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User URLs retrieved successfully",
    data: result,
  });
});

// redirect URL
const redirectUrl = catchAsync(async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  if (!shortCode) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Short code is required",
      data: null,
    });
  }

  const urlRecord = await UrlShortenerService.getUrlByShortCode(shortCode);

  // Increment click count
  await UrlShortenerService.incrementClicks(shortCode);

  // Redirect to original URL
  res.redirect(urlRecord.originalUrl);
});

// delete URL
const deleteUrl = catchAsync(async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  const userId = req.user?.id;

  if (!shortCode) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Short code is required",
      data: null,
    });
  }

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "User authentication required",
      data: null,
    });
  }

  await UrlShortenerService.deleteUrl(shortCode, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "URL deleted successfully",
    data: null,
  });
});

// get URL analytics
const getUrlAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  const userId = req.user?.id;

  const analytics = await UrlShortenerService.getUrlAnalytics(shortCode, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "URL analytics retrieved successfully",
    data: analytics,
  });
});

export const UrlShortenerController = {
  createShortUrl,
  getUserUrls,
  redirectUrl,
  deleteUrl,
  getUrlAnalytics,
};
