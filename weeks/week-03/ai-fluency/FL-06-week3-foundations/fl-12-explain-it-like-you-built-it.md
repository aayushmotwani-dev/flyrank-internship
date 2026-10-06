# Explain It Like You Built It

## How the portfolio page goes live

The page in my `flyrank-fl-07-blank-live` repository is just one HTML file. The browser reads the HTML and builds the headings, paragraphs, and links from it. The small `<style>` block gives the page its colors, spacing, and type sizes; it is not a framework hiding the layout.

GitHub Pages publishes the repository's `main` branch as a static site. When I push a change, GitHub Pages copies the files to its hosting service. A visitor's browser then requests `index.html` over HTTPS and renders the result. There is no server-side application behind this page yet, which is why the page is fast but cannot store form submissions or run backend code.

The useful lesson for me was separating “the file exists” from “the file is reachable.” A correct local file is not enough: the Pages setting has to point at the right branch and folder, the public URL has to return the page, and the page still needs a narrow-screen check. That is the part I had not understood at first.

## What I checked

- The public Pages URL loads without a GitHub login.
- The title and one-line claim match the repository README.
- The layout remains readable at a narrow browser width.

The next step is adding case-study links while keeping the same simple publishing path.
