import app from "./src/app.js";
import { env } from "./src/config/env.js";

const startServer = () => {
  const server = app.listen(env.port, () => {
    console.log(`10X CRM backend running on port ${env.port}`);
  });

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection:", error);
    server.close(() => process.exit(1));
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Closing backend server.");
    server.close(() => process.exit(0));
  });
};

startServer();
