import express from "express";
import { getClients, getClientProjects } from "../integrations/memtime.api.js";
import { validatePagination } from "../middleware/validatePagination.js";
import { ApiError } from "../errors/ApiError.js";

const router = express.Router();

router.get("/", validatePagination, async (req, res) => {
  const clients = await getClients(res.locals.pagination);
  res.json(clients);
});

router.get("/:clientId/projects", validatePagination, async (req, res) => {
  const clientId = Number(req.params.clientId);

  if (!Number.isSafeInteger(clientId) || clientId < 1) {
    throw new ApiError(400, "Client ID must be a positive integer");
  }

  const projects = await getClientProjects(clientId, res.locals.pagination);
  res.json(projects);
});

export default router;
