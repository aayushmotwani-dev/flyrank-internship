import assert from "node:assert/strict";
import test from "node:test";
import { parseBooks, parseRobots, scrapePages } from "./scraper.js";

const card = (title, price = "£12.34", rating = "Three") => "<article class=\"product_pod\"><h3><a href=\"" + title.toLowerCase().replaceAll(" ", "-") + "_1/index.html\" title=\"" + title + "\">" + title + "</a></h3><p class=\"price_color\">" + price + "</p><p class=\"star-rating " + rating + "\"></p><p class=\"availability\"> In stock </p></article>";
const html = (title = "A Test Book") => "<html><body>" + card(title) + "</body></html>";

test("parses and validates a book card", () => {
  const [record] = parseBooks(html(), "https://books.toscrape.com/catalogue/page-1.html");
  assert.equal(record.ok, true);
  assert.deepEqual(record.value, { title: "A Test Book", price: 12.34, rating: 3, availability: "In stock", url: "https://books.toscrape.com/catalogue/a-test-book_1/index.html" });
});

test("treats a missing robots file as no published rules and reports broken pages", async () => {
  const requested = [];
  const fakeFetch = async (url) => {
    requested.push(url);
    if (url.endsWith("robots.txt")) return { status: 404, ok: false, text: async () => "" };
    if (url.endsWith("page-2.html")) return { status: 500, ok: false, text: async () => "" };
    return { status: 200, ok: true, text: async () => html(url.endsWith("page-3.html") ? "Third Book" : "First Book") };
  };
  const result = await scrapePages({ pages: [1, 2, 3], delayMs: 0, fetchImpl: fakeFetch });
  assert.equal(result.books.length, 2);
  assert.equal(result.errors[0].page, 2);
  assert.deepEqual(requested, ["https://books.toscrape.com/robots.txt", "https://books.toscrape.com/catalogue/page-1.html", "https://books.toscrape.com/catalogue/page-2.html", "https://books.toscrape.com/catalogue/page-2.html", "https://books.toscrape.com/catalogue/page-2.html", "https://books.toscrape.com/catalogue/page-3.html"]);
});

test("recognizes a disallowed catalogue path", () => {
  const policy = parseRobots("User-agent: *\nDisallow: /catalogue/\n", "https://books.toscrape.com");
  assert.equal(policy.allowed, false);
});
