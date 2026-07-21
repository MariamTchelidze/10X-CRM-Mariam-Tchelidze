import app from "./src/app.js";
import { connectDatabase } from "./src/config/db.js";
import { env } from "./src/config/env.js";

const startServer = async () => {
  await connectDatabase();

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

startServer().catch((error) => {
  console.error("Failed to start backend:", error.message);
  process.exit(1);
});
