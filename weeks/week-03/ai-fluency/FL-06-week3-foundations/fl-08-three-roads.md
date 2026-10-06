# FL-08 — Three Roads: Choose My Stack with AI

## Decision in one sentence

I chose a static HTML/CSS site on GitHub Pages because my current goal is to show backend work clearly, keep the first version free, and use a stack I can maintain without inventing a backend for a mostly-read-only portfolio.

## The real constraints

- **Cost:** free hosting and no paid services.
- **Current skill level:** comfortable with backend JavaScript, APIs, SQL, tests, and GitHub; still learning production frontend deployment and visual design.
- **Portfolio need:** show a short proof statement, case-study pages, code repositories, test evidence, and readable project notes. The main action is opening a public repository and following its README.
- **Display:** readable long-form case studies plus links to repositories and a few real screenshots. No gallery-heavy presentation is required yet.
- **Dynamic now:** no. The first site does not need accounts, a database, a contact form, or server-side rendering.

The Week 3 content map and identity kit are in [the foundations repository](https://github.com/aayushmotwani-dev/flyrank-fl-06-week3-foundations). The first hosted shell is in [FL-07](https://github.com/aayushmotwani-dev/flyrank-fl-07-blank-live).

## Three genuine options

### 1. Static HTML and CSS — simplest

**How I would build it:** a small set of semantic HTML pages with one CSS file, using the identity kit directly. Each case study would be written as problem, decision, outcome, and evidence.

**Free host:** GitHub Pages, Cloudflare Pages, or Netlify.

**Backend needed:** not yet.

**Trade-off:** this is the easiest to understand and maintain, but it has less built-in structure if the number of pages grows. I would add a static-site generator only when repeated content becomes a real problem.

### 2. Astro — middle option

**How I would build it:** Astro pages and content files, with Markdown for case studies and a small shared layout. The output can remain static.

**Free host:** GitHub Pages, Cloudflare Pages, or Netlify.

**Backend needed:** not yet.

**Trade-off:** content collections and shared components would make a larger portfolio cleaner, but they add a framework, build configuration, and another set of concepts I do not need for the first page.

### 3. Next.js — most powerful

**How I would build it:** Next.js with a shared layout, Markdown or a small content layer, and optional server routes later for a dynamic contact workflow or project data.

**Free host:** Vercel's free tier for a small personal site.

**Backend needed:** not for the first read-only version; server routes would make one available later.

**Trade-off:** it gives the most room for dynamic features, but that room is also maintenance: framework upgrades, deployment behavior, and a more complex mental model for a site that currently needs none of it.

## Pressure test

### If I pick the simplest

What breaks first is not the proof of work; it is repeated navigation and content formatting if the portfolio grows. That is a manageable ceiling. I can move the content into Astro later without changing the case-study evidence or public repository links.

### If I pick the most powerful

I would maintain a framework, build settings, hosting behavior, and server boundaries before having a real feature that benefits from them. That makes it easier to polish the frame while delaying the work I actually want to show.

### Can I finish in two weeks?

Yes with static HTML/CSS. Astro is also realistic but gives me a setup task before the portfolio has enough content to justify it. Next.js is possible, but it creates more surface area and therefore more opportunities to spend the two weeks on plumbing.

### Does it show my work well?

Yes. My work is primarily API behavior, tests, README explanations, and trade-offs. Direct repository links and readable case studies show that better than a highly animated landing page. Real screenshots can be added where they help, but they should support the evidence rather than replace it.

## My decision in my own words

I am choosing static HTML and CSS on GitHub Pages for the first version. It is free, transparent, and close to the material I need to present. I can read every line, change the design without a build system, and keep the case studies focused on the backend work.

I did not choose Astro because its content model would be useful later, not because it is a bad tool. I did not choose Next.js because I do not have a dynamic requirement yet. The important question is **can I maintain this?** For the first version, yes: a few HTML pages and one stylesheet are within my current skill level. The second question is **does it show my work well?** Yes, because the evidence is in the repositories and READMEs, and the site can make those paths easy to follow.

## AI review and corrections

The easy AI mistake here would be to recommend Next.js as the default "professional" answer, or to describe a generic portfolio instead of the actual content map. I corrected that by keeping the constraints explicit, comparing three options, and answering the backend question honestly: I do not need one for this first static version.
