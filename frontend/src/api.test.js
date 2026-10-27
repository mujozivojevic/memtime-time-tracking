import { describe, expect, test, vi } from "vitest";
import { createTimeEntry, getTimeEntries } from "./api.js";

function mockFetch(status, body) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe("api", () => {
  test("sends pagination as query parameters", async () => {
    const fetch = mockFetch(200, []);

    await getTimeEntries({ limit: 10, offset: 20 });

    expect(fetch.mock.calls[0][0]).toBe("/api/time-entries?limit=10&offset=20");
  });

  test("throws the error message from the server", async () => {
    mockFetch(404, { error: "Task #1 not found" });

    await expect(createTimeEntry({ taskId: 1 })).rejects.toThrow(
      "Task #1 not found",
    );
  });
});
