import {
  createTimeEntry,
  updateTimeEntry,
} from "../integrations/memtime.api.js";
import { validateTimeEntryInput } from "../validation/timeEntry.validation.js";

export async function addTimeEntry(input) {
  const entry = validateTimeEntryInput(input);
  return await createTimeEntry(entry);
}

export async function editTimeEntry(id, input) {
  const entry = validateTimeEntryInput(input);

  return await updateTimeEntry(id, entry);
}
