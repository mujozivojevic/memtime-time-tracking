const errorResponse = (description, example) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { error: example },
    },
  },
});

const listResponse = (schema) => ({
  description: "OK",
  content: {
    "application/json": {
      schema: {
        type: "array",
        items: { $ref: `#/components/schemas/${schema}` },
      },
    },
  },
});

const idParameter = (name, description, minimum = 1) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "integer", minimum },
});

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Memtime Backend API",
    version: "1.0.0",
    description:
      "Backend for the Memtime time tracking app. It forwards requests to the " +
      "Memtime API and keeps the Memtime API key on the server, so clients " +
      "never see it.\n\n" +
      "**Rate limits**\n" +
      "- This API: 100 requests per 15 minutes per IP (`429`).\n" +
      "- Memtime: 15 requests per minute for the whole app. When it is reached, " +
      "this API returns `503`.\n\n" +
      '**Errors** always have the shape `{ "error": "Message" }`.',
  },
  servers: [{ url: "http://localhost:3001", description: "Local" }],
  tags: [
    { name: "Health" },
    { name: "Clients" },
    { name: "Projects" },
    { name: "Time entries" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check that the server is running",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": { example: { status: "ok" } },
            },
          },
        },
      },
    },
    "/api/clients": {
      get: {
        tags: ["Clients"],
        summary: "List clients",
        parameters: [
          { $ref: "#/components/parameters/Limit" },
          { $ref: "#/components/parameters/Offset" },
        ],
        responses: {
          200: listResponse("Client"),
          400: { $ref: "#/components/responses/BadRequest" },
          429: { $ref: "#/components/responses/TooManyRequests" },
          502: { $ref: "#/components/responses/BadGateway" },
          503: { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },
    "/api/clients/{clientId}/projects": {
      get: {
        tags: ["Projects"],
        summary: "List projects of a client",
        parameters: [
          idParameter("clientId", "Client ID"),
          { $ref: "#/components/parameters/Limit" },
          { $ref: "#/components/parameters/Offset" },
        ],
        responses: {
          200: listResponse("Project"),
          400: { $ref: "#/components/responses/BadRequest" },
          404: errorResponse("Client not found", "Client not found"),
          429: { $ref: "#/components/responses/TooManyRequests" },
          503: { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },
    "/api/projects/{projectId}/tasks": {
      get: {
        tags: ["Projects"],
        summary: "List tasks of a project",
        parameters: [
          idParameter("projectId", "Project ID"),
          { $ref: "#/components/parameters/Limit" },
          { $ref: "#/components/parameters/Offset" },
        ],
        responses: {
          200: listResponse("Task"),
          400: { $ref: "#/components/responses/BadRequest" },
          404: errorResponse("Project not found", "Project not found"),
          429: { $ref: "#/components/responses/TooManyRequests" },
          503: { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },
    "/api/time-entries": {
      get: {
        tags: ["Time entries"],
        summary: "List your time entries",
        description: "Newest first, sorted by start time.",
        parameters: [
          { $ref: "#/components/parameters/Limit" },
          { $ref: "#/components/parameters/Offset" },
        ],
        responses: {
          200: listResponse("TimeEntry"),
          400: { $ref: "#/components/responses/BadRequest" },
          429: { $ref: "#/components/responses/TooManyRequests" },
          503: { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
      post: {
        tags: ["Time entries"],
        summary: "Create a time entry",
        requestBody: { $ref: "#/components/requestBodies/TimeEntryInput" },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TimeEntry" },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: errorResponse("Task not found", "Task #999 not found"),
          429: { $ref: "#/components/responses/TooManyRequests" },
          503: { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },
    "/api/time-entries/{id}": {
      put: {
        tags: ["Time entries"],
        summary: "Update a time entry",
        parameters: [
          idParameter("id", "Time entry ID (Memtime starts at 0)", 0),
        ],
        requestBody: { $ref: "#/components/requestBodies/TimeEntryInput" },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TimeEntry" },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: errorResponse(
            "Time entry or task not found",
            "Time entry #1 not found",
          ),
          429: { $ref: "#/components/responses/TooManyRequests" },
          503: { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },
  },
  components: {
    parameters: {
      Limit: {
        name: "limit",
        in: "query",
        description: "Number of results to return",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
      },
      Offset: {
        name: "offset",
        in: "query",
        description: "Number of results to skip",
        schema: { type: "integer", minimum: 0, default: 0 },
      },
    },
    requestBodies: {
      TimeEntryInput: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/TimeEntryInput" },
          },
        },
      },
    },
    responses: {
      BadRequest: errorResponse(
        "Invalid input. The message says what is wrong.",
        "End must be after start",
      ),
      TooManyRequests: errorResponse(
        "Too many requests to this API",
        "Too many requests, please try again",
      ),
      BadGateway: errorResponse(
        "Memtime could not be reached or returned an unexpected error",
        "Memtime could not process the request",
      ),
      ServiceUnavailable: errorResponse(
        "Memtime rate limit reached",
        "Memtime is temporarily unavailable, please try again later",
      ),
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
      Client: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Acme Corp" },
          description: { type: "string", example: "Leading supplier" },
          status: { type: "string", example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "integer", example: 101 },
          clientId: { type: "integer", example: 1 },
          name: { type: "string", example: "Website redesign" },
          status: { type: "string", example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "integer", example: 398 },
          name: { type: "string", example: "Design mockups" },
          status: { type: "string", example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TimeEntry: {
        type: "object",
        properties: {
          id: { type: "integer", example: 12 },
          taskId: { type: "integer", example: 398 },
          comment: { type: "string", example: "Worked on the login page" },
          start: { type: "string", format: "date-time" },
          end: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TimeEntryInput: {
        type: "object",
        required: ["taskId", "comment", "start", "end"],
        properties: {
          taskId: { type: "integer", minimum: 1, example: 398 },
          comment: {
            type: "string",
            minLength: 1,
            maxLength: 500,
            example: "Worked on the login page",
          },
          start: {
            type: "string",
            format: "date-time",
            description:
              "ISO 8601 with a time zone. Must be in the current year or later.",
            example: "2026-10-27T09:00:00Z",
          },
          end: {
            type: "string",
            format: "date-time",
            description:
              "ISO 8601 with a time zone. Must be after start and not in the future.",
            example: "2026-10-27T10:30:00Z",
          },
        },
      },
    },
  },
};
