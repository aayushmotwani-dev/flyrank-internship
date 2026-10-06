# Task API with SQLite

BE-02 replaces the in-memory task list from BE-01 with a SQLite database while keeping the same API contract.

## Run

~~~bash
npm install
npm start
~~~

The first start creates tasks.db, creates the tasks table, and inserts three example rows only when the table is empty. Open Swagger UI at http://localhost:3000/docs to try the endpoints.

## SQL example

~~~sql
SELECT * FROM tasks WHERE done = 1;
~~~

The database file is local and ignored by Git. SQLite was chosen because it needs no separate database server and makes persistence easy to inspect.

## Check

~~~bash
npm test
~~~
