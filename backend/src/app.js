import express from "express";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./docs/openapi.js";
import clientsRouter from "./routes/clients.routes.js";
import projectsRouter from "./routes/projects.routes.js";
import timeEntries from "./routes/timeEntries.routes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api-docs.json", (req, res) => {
  res.json(openapiSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use("/api", apiLimiter);
app.use("/api/time-entries", timeEntries);
app.use("/api/projects", projectsRouter);
app.use("/api/clients", clientsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

export default app;
