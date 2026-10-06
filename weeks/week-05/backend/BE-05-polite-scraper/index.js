import { mkdir, writeFile } from "node:fs/promises";
import { scrapePages } from "./scraper.js";

const result = await scrapePages();
await mkdir("data", { recursive: true });
await writeFile("data/books.json", JSON.stringify(result.books, null, 2) + "\n");
console.log("Saved " + result.books.length + " books from " + result.requestedPages.length + " pages to data/books.json");
if (result.errors.length) {
  console.error("Warnings:", JSON.stringify(result.errors));
  process.exitCode = 2;
}
