# Task API

An in-memory CRUD API built for FlyRank assignment BE-01.

## Run

```bash
npm install
npm start
```

Open [Swagger UI](http://localhost:3000/docs) to try the API.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | API metadata |
| GET | `/health` | Health check |
| GET | `/tasks` | List tasks |
| GET | `/tasks/:id` | Read one task |
| POST | `/tasks` | Create a task with `{ "title": "..." }` |
| PUT | `/tasks/:id` | Update `title` and/or `done` |
| DELETE | `/tasks/:id` | Delete a task |

Data is intentionally stored in memory and resets when the server restarts.

## Check

```bash
npm test
```
