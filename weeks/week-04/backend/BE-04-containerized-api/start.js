import { app } from "./server.js";

const port = Number(process.env.PORT ?? 3000);
app.listen(port, "0.0.0.0", () => console.log("Task API listening on http://localhost:" + port));
