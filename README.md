# Memtime time tracking

A small app on top of the Memtime API. You can browse clients, projects and tasks, see your time entries and create or edit them.

- `backend/` is an Express server that talks to Memtime
- `frontend/` is a React app (Vite) that talks only to the backend

## Running it

```bash
cd backend
npm install
cp .env.sample .env
npm run dev
```

Before `npm run dev`, put the Memtime base URL (`https://interview-api.memtime-demo.deno.net/api/v1`) and your API key into `.env`. The backend runs on <http://localhost:3001>, and Swagger docs are at `/api-docs`.

Then, in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Tests run with `npm test` in either folder.

## How it works

```text
browser ──> frontend (React) ──/api──> backend (Express) ──> Memtime API
```

On the frontend:

- **The tree** loads projects and tasks only when you open them. Memtime allows just 15 requests per minute.
- **The table** shows 10 entries per page, newest first.
- **Clicking a task** in the tree fills in the form.
- **Clicking Edit** in the table loads that entry into the form.
- **After saving**, the table refreshes.

