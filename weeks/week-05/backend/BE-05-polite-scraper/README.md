# The Polite Scraper

BE-05 collects the first three catalogue pages from Books to Scrape, turns the messy book cards into clean JSON, and records page-level problems instead of crashing on the first bad response.

## Run

~~~bash
npm install
npm run scrape
~~~

The result is written to `data/books.json`. A successful live run should contain 60 books: 20 records from each of pages 1, 2, and 3.

## What makes it polite

- Checks `/robots.txt` before collecting pages. The practice site returned `404` for this file when I checked it; the scraper treats only that missing-file case as "no published rules."
- Sends a descriptive `User-Agent` instead of pretending to be a browser.
- Waits one second between catalogue pages. A published `Crawl-delay` is respected and never reduced below one second.
- Uses a request timeout and two small retries for transient failures.
- Requests exactly three pages rather than crawling the whole 1,000-book catalogue.
- Reports a broken page in the result warnings and keeps valid records from other pages.

## Output shape

~~~json
{
  "title": "A Light in the Attic",
  "price": 51.77,
  "rating": 3,
  "availability": "In stock",
  "url": "https://books.toscrape.com/catalogue/..."
}
~~~

Prices are numbers, ratings are integers from 1 to 5, URLs are absolute, and every record is checked before it is written. `npm test` uses fixture HTML and a fake fetch function, so tests do not make unnecessary requests to the practice site.

## Check

~~~bash
npm test
~~~

The tests cover parsing, price/rating normalization, schema checks, missing `robots.txt`, a failed page that must not stop the run, and a disallowed path.

## Mistakes I checked before writing it

- Scraping page 1 only: the page loop is explicit and the expected count is three pages × 20 cards.
- Hammering the site: requests are spaced and bounded by retries/timeouts.
- Ignoring access rules: robots is checked and a real disallow fails closed.
- Treating `£51.77` or `Three` as final data: both are normalized before validation.
- Crashing when one page changes: page errors are collected while other pages continue.
- Trusting selectors blindly: missing title, price, rating, availability, or absolute URL fails schema validation.
- Saving fake success: the CLI prints the count and exits with a warning status if any page or record failed.
