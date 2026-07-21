import app from "./src/app.js";
import { env } from "./src/config/env.js";

const startServer = () => {
  app.listen(env.port, () => {
    console.log(`10X CRM backend running on port ${env.port}`);
  });
};

startServer();
