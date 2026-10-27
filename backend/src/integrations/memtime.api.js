import { memtimeRequest } from "./memtime.request.js";

export function getClients(pagination) {
  return memtimeRequest("clients", pagination);
}

export function getClientProjects(clientId, pagination) {
  return memtimeRequest(`clients/${clientId}/projects`, pagination);
}

export function getProjectTasks(projectId, pagination) {
  return memtimeRequest(`projects/${projectId}/tasks`, pagination);
}

function toTimeEntry(entry) {
  return {
    id: entry.id,
    taskId: entry.taskId,
    comment: entry.comment,
    start: entry.start,
    end: entry.end,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export async function getTimeEntries(pagination) {
  const entries = await memtimeRequest("time-entries", pagination);
  return entries.map(toTimeEntry);
}

export async function createTimeEntry(entry) {
  const created = await memtimeRequest(
    "time-entries",
    {},
    {
      method: "POST",
      body: entry,
    },
  );
  return toTimeEntry(created);
}

export async function updateTimeEntry(id, entry) {
  const updated = await memtimeRequest(
    `time-entries/${id}`,
    {},
    {
      method: "PUT",
      body: entry,
    },
  );
  return toTimeEntry(updated);
}
