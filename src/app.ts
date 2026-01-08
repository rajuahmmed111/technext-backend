import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import router from "./app/routes";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

const app: Application = express();

export const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://technext-frontend.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(
  bodyParser.json({
    verify: function (
      req: express.Request,
      res: express.Response,
      buf: Buffer
    ) {
      req.rawBody = buf;
    },
  })
);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Route handler for the root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Technext Project API",
  });
});

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Setup API routes
app.use("/api/v1", router);

// Error handling middleware
app.use(GlobalErrorHandler);

// 404 Not Found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
