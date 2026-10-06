# Containerized Task API

BE-04 keeps the CRUD routes from BE-02 and moves storage behind a PostgreSQL repository. The app and database start together with Docker Compose, and PostgreSQL uses a named volume so rows survive container restarts.

## Run

~~~bash
copy .env.example .env
docker compose up --build
~~~

Open [Swagger UI](http://localhost:3001/docs) or use the API at `http://localhost:3001`.

The committed `.env.example` contains the connection shape. `.env` is gitignored. The app listens on `0.0.0.0` inside its container, while Compose publishes host port 3001 to container port 3000.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | API metadata |
| GET | `/health` | Health check |
| GET | `/tasks` | List tasks; supports `search` and `done` filters |
| GET | `/tasks/:id` | Read one task |
| POST | `/tasks` | Create a task with `{ "title": "..." }` |
| PUT | `/tasks/:id` | Update `title` and/or `done` |
| DELETE | `/tasks/:id` | Delete a task |

## Persistence check

Create a row, restart both services, and request the list again:

~~~bash
curl -X POST http://localhost:3001/tasks -H "Content-Type: application/json" -d "{\"title\":\"survives restart\"}"
docker compose restart app db
curl http://localhost:3001/tasks?search=survives
~~~

The row remains because the database uses the `postgres_data` volume. The `init.sql` file creates the table and adds the three seed rows only when the database is empty; Postgres runs that init script on first volume creation.

## Check

With the Compose stack running:

~~~bash
npm install
npm test
~~~

The repository is the only storage-specific module changed from the SQLite version; the route contract and status-code behavior stay the same.
