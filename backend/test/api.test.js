import { describe, test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

const year = new Date().getUTCFullYear();

const validEntry = {
  taskId: 1,
  comment: "Meeting",
  start: `${year}-01-01T12:00:00Z`,
  end: `${year}-01-01T12:30:00Z`,
};

function mockFetch(status, body) {
  return mock.method(
    globalThis,
    "fetch",
    async () => new Response(JSON.stringify(body), { status }),
  );
}

beforeEach(() => mock.method(console, "error", () => {}));
afterEach(() => mock.restoreAll());

describe("GET /health", () => {
  test("returns ok", async () => {
    const res = await request(app).get("/health");

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "ok" });
  });
});

describe("API docs", () => {
  test("serves the OpenAPI spec and Swagger UI", async () => {
    const spec = await request(app).get("/api-docs.json");
    const ui = await request(app).get("/api-docs/");

    assert.equal(spec.status, 200);
    assert.ok(spec.body.paths["/api/time-entries"]);
    assert.equal(ui.status, 200);
    assert.match(ui.text, /swagger-ui/);
  });
});

describe("GET /api/clients", () => {
  test("returns clients from Memtime", async () => {
    mockFetch(200, [{ id: 1, name: "Acme" }]);

    const res = await request(app).get("/api/clients");

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, [{ id: 1, name: "Acme" }]);
  });

  test("sends default pagination to Memtime", async () => {
    const fetch = mockFetch(200, []);

    await request(app).get("/api/clients");

    const [url] = fetch.mock.calls[0].arguments;
    assert.equal(url.searchParams.get("limit"), "10");
    assert.equal(url.searchParams.get("offset"), "0");
  });

  for (const query of ["limit=0", "limit=101", "limit=abc", "offset=-1"]) {
    test(`returns 400 for ${query}`, async () => {
      const fetch = mockFetch(200, []);

      const res = await request(app).get(`/api/clients?${query}`);

      assert.equal(res.status, 400);
      assert.equal(typeof res.body.error, "string");
      assert.equal(fetch.mock.callCount(), 0);
    });
  }
});

describe("invalid ids in the URL", () => {
  for (const path of ["/api/clients/abc/projects", "/api/projects/0/tasks"]) {
    test(`GET ${path} returns 400`, async () => {
      const res = await request(app).get(path);

      assert.equal(res.status, 400);
    });
  }

  test("PUT /api/time-entries/x returns 400", async () => {
    const res = await request(app).put("/api/time-entries/x").send(validEntry);

    assert.equal(res.status, 400);
  });
});

describe("GET /api/time-entries", () => {
  test("does not expose userId, which is the Memtime API key", async () => {
    mockFetch(200, [{ id: 1, userId: "secret-api-key", ...validEntry }]);

    const res = await request(app).get("/api/time-entries");

    assert.equal(res.status, 200);
    assert.equal(res.body[0].id, 1);
    assert.equal("userId" in res.body[0], false);
  });
});

describe("POST /api/time-entries", () => {
  test("creates an entry", async () => {
    const fetch = mockFetch(201, {
      id: 10,
      userId: "secret-api-key",
      ...validEntry,
    });

    const res = await request(app).post("/api/time-entries").send(validEntry);

    assert.equal(res.status, 201);
    assert.equal(res.body.id, 10);
    assert.equal("userId" in res.body, false);
    assert.equal(fetch.mock.callCount(), 1);
  });

  test("returns 400 without calling Memtime for invalid input", async () => {
    const fetch = mockFetch(201, {});

    const res = await request(app)
      .post("/api/time-entries")
      .send({ ...validEntry, taskId: 0 });

    assert.equal(res.status, 400);
    assert.equal(fetch.mock.callCount(), 0);
  });

  test("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/time-entries")
      .set("Content-Type", "application/json")
      .send("{ bad json");

    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: "Invalid JSON body" });
  });

  test("passes a Memtime 404 through to the client", async () => {
    mockFetch(404, { error: "Task #1 not found" });

    const res = await request(app).post("/api/time-entries").send(validEntry);

    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { error: "Task #1 not found" });
  });
});

describe("PUT /api/time-entries/:id", () => {
  test("updates an entry", async () => {
    const fetch = mockFetch(200, { id: 5, ...validEntry });

    const res = await request(app).put("/api/time-entries/5").send(validEntry);

    assert.equal(res.status, 200);
    assert.equal(res.body.id, 5);

    const [url, options] = fetch.mock.calls[0].arguments;
    assert.equal(url.pathname, "/time-entries/5");
    assert.equal(options.method, "PUT");
  });

  test("accepts id 0, which Memtime uses", async () => {
    mockFetch(200, { id: 0, ...validEntry });

    const res = await request(app).put("/api/time-entries/0").send(validEntry);

    assert.equal(res.status, 200);
    assert.equal(res.body.id, 0);
  });
});

describe("unknown routes", () => {
  test("return 404 in the API error format", async () => {
    const res = await request(app).get("/api/unknown");

    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { error: "Route not found" });
  });
});
