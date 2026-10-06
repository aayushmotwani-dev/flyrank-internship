const ratings = new Map([["One", 1], ["Two", 2], ["Three", 3], ["Four", 4], ["Five", 5]]);

export function parsePrice(value) {
  const number = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : null;
}

export function parseRating(className = "") {
  const word = className.split(/\s+/).find((part) => ratings.has(part));
  return word ? ratings.get(word) : null;
}

export function validateBook(book) {
  if (!book || typeof book !== "object") return { ok: false, error: "record is not an object" };
  if (typeof book.title !== "string" || !book.title.trim()) return { ok: false, error: "title is required" };
  if (!Number.isFinite(book.price) || book.price < 0) return { ok: false, error: "price must be a non-negative number" };
  if (!Number.isInteger(book.rating) || book.rating < 1 || book.rating > 5) return { ok: false, error: "rating must be an integer from 1 to 5" };
  if (typeof book.availability !== "string" || !book.availability.trim()) return { ok: false, error: "availability is required" };
  if (typeof book.url !== "string" || !book.url.startsWith("http")) return { ok: false, error: "url must be absolute" };
  return { ok: true, value: { ...book, title: book.title.trim(), availability: book.availability.trim() } };
}
