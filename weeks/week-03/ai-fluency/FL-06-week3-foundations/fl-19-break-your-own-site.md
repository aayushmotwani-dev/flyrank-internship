# Break Your Own Site — hardening record

## Target

- Live site: https://aayushmotwani-dev.github.io/flyrank-fl-07-blank-live/
- Source: https://github.com/aayushmotwani-dev/flyrank-fl-07-blank-live

## Where I tried to break it

- Opened the site while logged out.
- Tested the narrow browser viewport used for the phone-check assignment.
- Clicked the portfolio action and checked the revealed output.
- Opened the GitHub profile/repository links.
- Checked the source for keyboard-visible controls, an accessible live region, viewport metadata, title, description, and social preview metadata.
- Checked the page's browser resource timing rather than pretending a synthetic speed score was available.
- The brief's empty-form and garbage-form tests are not applicable because this shell has no user form or data submission endpoint.

## Triage

### Fix now — addressed

- Missing page description and social preview metadata → added `description`, Open Graph, and Twitter card metadata.
- Demo button only opened the output and could not close it → changed it to a real show/hide toggle and kept `aria-expanded` plus an `aria-live` output.
- The page needed a clear proof action → kept the one small backend-flow demo and the public GitHub profile link.

### Known limitations

- GitHub Pages build/cache propagation can make the newest HTML take a short time to appear publicly after the repository commit.
- There is no backend form on this page, so form validation and duplicate-submit behavior belong to the capstone API rather than this static shell.
- No physical phone or external synthetic speed score was available in this pass; the narrow browser check and resource-timing inspection are recorded honestly.

## Speed and SEO check

- The page is a small static HTML file with no images, dependencies, or external JavaScript.
- The public source has a descriptive title, description, canonical page URL in Open Graph metadata, and a social card declaration.
- The next useful check is a real phone touch test plus a public PageSpeed/Lighthouse run when the page cache has settled.
