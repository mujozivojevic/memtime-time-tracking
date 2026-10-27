import express from "express";
import { validatePagination } from "../middleware/validatePagination.js";
import { getTimeEntries } from "../integrations/memtime.api.js";
import {
  addTimeEntry,
  editTimeEntry,
} from "../services/timeEntries.service.js";
import { ApiError } from "../errors/ApiError.js";

const router = express.Router();

router.get("/", validatePagination, async (req, res) => {
  const entries = await getTimeEntries({
    ...res.locals.pagination,
    sortBy: "start",
    order: "desc",
  });
  res.json(entries);
});

router.post("/", async (req, res) => {
  const entry = await addTimeEntry(req.body);
  res.status(201).json(entry);
});

router.put("/:id", async (req, res) => {
  const rawId = req.params.id;
  const id = Number(rawId);

  if (!/^\d+$/.test(rawId) || !Number.isSafeInteger(id)) {
    throw new ApiError(400, "Time entry ID must be a non-negative integer");
  }

  const entry = await editTimeEntry(id, req.body);
  res.json(entry);
});

export default router;
