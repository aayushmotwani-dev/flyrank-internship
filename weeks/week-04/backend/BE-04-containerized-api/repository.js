import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const toTask = (row) => row && ({ id: row.id, title: row.title, done: row.done });

export async function listTasks({ search, done } = {}) {
  const values = [];
  const filters = [];
  if (search) {
    values.push("%" + search + "%");
    filters.push("title ILIKE $" + values.length);
  }
  if (done !== undefined) {
    values.push(done);
    filters.push("done = $" + values.length);
  }
  const where = filters.length ? " WHERE " + filters.join(" AND ") : "";
  const result = await pool.query("SELECT id, title, done FROM tasks" + where + " ORDER BY id", values);
  return result.rows.map(toTask);
}

export async function getTask(id) {
  const result = await pool.query("SELECT id, title, done FROM tasks WHERE id = $1", [Number(id)]);
  return toTask(result.rows[0]);
}

export async function createTask(title) {
  const result = await pool.query("INSERT INTO tasks (title, done) VALUES ($1, FALSE) RETURNING id, title, done", [title]);
  return toTask(result.rows[0]);
}

export async function updateTask(id, { title, done }) {
  const current = await getTask(id);
  if (!current) return null;
  const nextTitle = title === undefined ? current.title : title;
  const nextDone = done === undefined ? current.done : done;
  const result = await pool.query("UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING id, title, done", [nextTitle, nextDone, Number(id)]);
  return toTask(result.rows[0]);
}

export async function deleteTask(id) {
  const result = await pool.query("DELETE FROM tasks WHERE id = $1", [Number(id)]);
  return result.rowCount > 0;
}

export { pool };
