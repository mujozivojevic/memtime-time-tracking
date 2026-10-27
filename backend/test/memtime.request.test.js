import { describe, test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { memtimeRequest } from "../src/integrations/memtime.request.js";

function mockFetch(status, body) {
  return mock.method(globalThis, "fetch", async () => {
    const text = typeof body === "string" ? body : JSON.stringify(body);
    return new Response(body === undefined ? null : text, { status });
  });
}

beforeEach(() => mock.method(console, "error", () => {}));
afterEach(() => mock.restoreAll());

describe("memtimeRequest", () => {
  describe("on success", () => {
    test("returns parsed JSON", async () => {
      mockFetch(200, { id: 1 });

      assert.deepEqual(await memtimeRequest("clients"), { id: 1 });
    });

    test("sends the API key, query and JSON body", async () => {
      const fetch = mockFetch(201, { id: 1 });

      await memtimeRequest(
        "time-entries",
        { limit: 10 },
        { method: "POST", body: { taskId: 1 } },
      );

      const [url, options] = fetch.mock.calls[0].arguments;
      assert.equal(
        url.toString(),
        "https://memtime.test/time-entries?limit=10",
      );
      assert.equal(options.method, "POST");
      assert.equal(options.headers.Authorization, "Bearer test-key");
      assert.equal(options.body, JSON.stringify({ taskId: 1 }));
    });

    test("returns null for 204 No Content", async () => {
      mockFetch(204);

      assert.equal(await memtimeRequest("time-entries/1"), null);
    });
  });

  describe("on Memtime errors", () => {
    test("passes the Memtime message through for 404", async () => {
      mockFetch(404, { error: "Task #1 not found" });

      await assert.rejects(memtimeRequest("tasks/1"), {
        statusCode: 404,
        message: "Task #1 not found",
      });
    });

    test("uses the fallback message when Memtime sends none", async () => {
      mockFetch(404);

      await assert.rejects(memtimeRequest("tasks/1"), {
        statusCode: 404,
        message: "The requested resource was not found",
      });
    });

    test("maps 429 to 503", async () => {
      mockFetch(429, { error: "Rate limit exceeded" });

      await assert.rejects(memtimeRequest("clients"), { statusCode: 503 });
    });

    for (const status of [401, 403, 500]) {
      test(`maps ${status} to 502 without leaking details`, async () => {
        mockFetch(status, { error: "Something internal" });

        await assert.rejects(memtimeRequest("clients"), {
          statusCode: 502,
          message: "Memtime could not process the request",
        });
      });
    }
  });

  describe("on broken responses", () => {
    test("maps network failures to 502", async () => {
      mock.method(globalThis, "fetch", async () => {
        throw new TypeError("fetch failed");
      });

      await assert.rejects(memtimeRequest("clients"), {
        statusCode: 502,
        message: "Unable to connect to Memtime",
      });
    });

    test("maps invalid JSON to 502", async () => {
      mockFetch(200, "not json");

      await assert.rejects(memtimeRequest("clients"), {
        statusCode: 502,
        message: "Invalid JSON response from Memtime",
      });
    });
  });
});
