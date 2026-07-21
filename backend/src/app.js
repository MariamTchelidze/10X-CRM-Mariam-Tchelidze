import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (request, response) => {
  response.status(200).json({
    status: "success",
    message: "10X CRM backend is ready for setup.",
  });
});

export default app;
