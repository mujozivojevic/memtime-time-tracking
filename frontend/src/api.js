const FIRST_100 = { limit: 100, offset: 0 };

async function request(path, { query, method = "GET", body } = {}) {
  const url = query
    ? `/api${path}?${new URLSearchParams(query)}`
    : `/api${path}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server, check your connection");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "Something went wrong, please try again");
  }

  return data;
}

export function getClients() {
  return request("/clients", { query: FIRST_100 });
}

export function getClientProjects(clientId) {
  return request(`/clients/${clientId}/projects`, { query: FIRST_100 });
}

export function getProjectTasks(projectId) {
  return request(`/projects/${projectId}/tasks`, { query: FIRST_100 });
}

export function getTimeEntries(pagination) {
  return request("/time-entries", { query: pagination });
}

export function createTimeEntry(entry) {
  return request("/time-entries", { method: "POST", body: entry });
}

export function updateTimeEntry(id, entry) {
  return request(`/time-entries/${id}`, { method: "PUT", body: entry });
}
