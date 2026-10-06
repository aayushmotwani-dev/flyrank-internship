import * as cheerio from "cheerio";
import { parsePrice, parseRating, validateBook } from "./schema.js";

export const DEFAULT_BASE_URL = "https://books.toscrape.com";
export const DEFAULT_USER_AGENT = "AayushLearningScraper/1.0 (+https://github.com/aayushmotwani-dev)";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function pageUrl(baseUrl, page) {
  return baseUrl + "/catalogue/page-" + page + ".html";
}

export async function fetchText(url, { fetchImpl = fetch, userAgent = DEFAULT_USER_AGENT, timeoutMs = 10000, retries = 2 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchImpl(url, { headers: { "user-agent": userAgent, accept: "text/html" }, signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) {
        if (response.status === 404) return { status: 404, text: "" };
        throw new Error("HTTP " + response.status);
      }
      return { status: response.status, text: await response.text() };
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(250 * (attempt + 1));
    }
  }
  throw lastError;
}

export function parseBooks(html, sourceUrl) {
  const $ = cheerio.load(html);
  return $("article.product_pod").toArray().map((element) => {
    const card = $(element);
    const relativeUrl = card.find("h3 a").attr("href") ?? "";
    const book = {
      title: card.find("h3 a").attr("title") ?? "",
      price: parsePrice(card.find(".price_color").text()),
      rating: parseRating(card.find(".star-rating").attr("class")),
      availability: card.find(".availability").text().replace(/\s+/g, " " ).trim(),
      url: new URL(relativeUrl, sourceUrl).href,
    };
    return validateBook(book);
  });
}

export function parseRobots(text, origin) {
  const lines = text.split(/\r?\n/).map((line) => line.split("#")[0].trim());
  let applies = false;
  const rules = [];
  let crawlDelayMs = 1000;
  for (const line of lines) {
    const [rawName, ...rawValue] = line.split(":");
    const name = rawName?.trim().toLowerCase();
    const value = rawValue.join(":").trim();
    if (name === "user-agent") applies = value === "*";
    if (applies && name === "disallow" && value) rules.push(value);
    if (applies && name === "crawl-delay" && Number.isFinite(Number(value))) crawlDelayMs = Math.max(1000, Number(value) * 1000);
  }
  return { allowed: !rules.some((rule) => "/catalogue/".startsWith(new URL(rule, origin).pathname)), crawlDelayMs, rules };
}

export async function scrapePages({ baseUrl = DEFAULT_BASE_URL, pages = [1, 2, 3], delayMs, fetchImpl = fetch } = {}) {
  const origin = new URL(baseUrl).origin;
  const robots = await fetchText(origin + "/robots.txt", { fetchImpl });
  if (robots.status !== 404) {
    const policy = parseRobots(robots.text, origin);
    const blocked = pages.some((page) => policy.rules.some((rule) => new URL(pageUrl(baseUrl, page)).pathname.startsWith(new URL(rule, origin).pathname)));
    if (blocked) throw new Error("robots.txt disallows the requested catalogue path");
  }
  const waitMs = delayMs ?? (robots.status === 404 ? 1000 : parseRobots(robots.text, origin).crawlDelayMs);
  const books = [];
  const errors = [];
  for (const [index, page] of pages.entries()) {
    if (index > 0) await sleep(waitMs);
    const url = pageUrl(baseUrl, page);
    try {
      const response = await fetchText(url, { fetchImpl });
      const records = parseBooks(response.text, url);
      for (const record of records) {
        if (record.ok) books.push(record.value);
        else errors.push({ page, error: record.error });
      }
      if (!records.length) errors.push({ page, error: "no book cards found" });
    } catch (error) {
      errors.push({ page, error: error.message });
    }
  }
  return { books, errors, requestedPages: pages, expectedCount: pages.length * 20 };
}
