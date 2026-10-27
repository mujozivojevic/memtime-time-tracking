import express from "express";
import { validatePagination } from "../middleware/validatePagination.js";
import { getProjectTasks } from "../integrations/memtime.api.js";
import { ApiError } from "../errors/ApiError.js";

const router = express.Router();

router.get("/:projectId/tasks", validatePagination, async (req, res) => {
  const projectId = Number(req.params.projectId);

  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    throw new ApiError(400, "Project ID must be a positive integer");
  }

  const tasks = await getProjectTasks(projectId, res.locals.pagination);
  res.json(tasks);
});

export default router;
