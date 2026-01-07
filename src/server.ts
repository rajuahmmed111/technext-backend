import { Server } from "http";
import app from "./app";
import config from "./config";

let server: Server | null = null;

async function main() {
  server = app.listen(config.port, () => {
    console.log("Server is running on port", config.port);
  });
}

main().catch((e) => {
  console.error("Fatal bootstrap error:", e);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("😈 unhandledRejection detected, shutting down...", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("😈 uncaughtException detected, shutting down...", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Closing server...");
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Closing server...");
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
