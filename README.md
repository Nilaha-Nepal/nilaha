# Nilaha

A responsive React website helping women in Nepal explore information and support. Open source under the existing MIT licence.

## Included

- Utility support hub, dedicated helplines, support requests, children & families, Get help, counselling directory and profiles, searchable articles, Support someone, About and Privacy pages.
- Working site search, counsellor filters, article filters, mobile navigation and a quick-exit control.
- National Women Commission 1145 and Nepal Police 100 contacts with official source links, checked 9 November 2026. These are independent services, not Nilaha partners.
- A separate dark calculator prototype at `/#/calculator` or `/calculator/index.html`. Keyboard key → 2580 (requests) or 1379 (counselling) → equals.
- React frontend, optional Supabase public content, Node.js/Express intake API and a database schema with row-level security.

## Current limits

Counsellor profiles are illustrative, not real practitioners. Articles are editorial previews requiring local professional review. No partnerships, verified counsellors or live availability are claimed. There is no team dashboard, live chat, appointment booking, SMS delivery or authentication UI. Database records can be managed by authorized operators through Supabase's dashboard.

Intake defaults to **disabled**. In this mode the form is a demonstration: nothing is transmitted or stored and the result explicitly says no request was sent. Do not enter real case information in the preview.

The calculator's hard-coded public PINs are navigation demonstrations, not authentication. Quick exit does not erase history or defeat monitoring software. Only the calculator shell has offline support; no support request is stored offline.

## Develop and build

Use Node.js 22 LTS or later.

```sh
npm ci
npm run dev
npm run build
npm test
```

Vite serves the public website in development (normally http://localhost:5173). `npm run preview` previews the production frontend. `npm start` serves the built frontend and API on port 3000, or the host-provided PORT.

For local full-stack development, run `npm start` after building in another terminal; Vite proxies `/api` to port 3000. Environment variables must be set in the Node process (or launch with Node's `--env-file` option). Vite loads local `.env` files at build time.

## Supabase setup

1. Create a Supabase project and run `supabase/schema.sql` once in its SQL editor.
2. Use `.env.example` as the variable reference. The URL and anon key are browser-safe and are supplied at build time through `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Add real counsellors and reviewed articles to the tables, setting `published=true` only for approved content. The sample directory is used only when Supabase is absent or unreachable; a connected empty directory shows no professionals.
4. Optional: run `node scripts/seed-public.mjs` to generate SQL for the current public article drafts and official helplines, then review it before running in Supabase. It does not publish counsellors or contain requests.
5. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only on the server. Never expose a service-role key in VITE variables, files uploaded as static assets, or Git.
6. Before enabling intake, establish staffing, response expectations, restricted operator access, retention/deletion policies and safeguarding procedures. Configure `APP_ORIGIN` to the exact HTTPS origin, then explicitly set `ENABLE_INTAKE=true` and restart.

Requests are validated and inserted by the server only. Anonymous and ordinary authenticated Supabase users cannot read or write requests. Basic per-process rate limiting is included; production needs shared rate limits and abuse protection. The server saves requests but does not notify staff or send SMS/WhatsApp. The team must monitor the restricted database and follow up externally using the user's consented channel.

## Hostinger

### Node.js hosting (frontend and API)

Import this repository, select Node 22 LTS or newer, install with `npm ci`, build with `npm run build` and start with `npm start` (entry point `server/index.js` if requested). The server serves `dist` and uses the host-provided PORT. Configure environment variables in the hosting panel. No domain is hard-coded.

### Static web hosting (frontend preview only)

Run `npm run build` and upload the **contents of `dist/`** to the new domain's document root, typically `public_html`. Include `.htaccess` and the calculator subfolder. Never upload the repository itself, server code, `.env` or service credentials to a public document root. Static hosting does not run the intake API: requests remain disabled unless an API is separately provided.

The Vercel configuration builds a static preview; the Express API requires Node hosting. The build generates separate HTML documents at real page URLs, including `/helplines/`, `/request-support/`, `/counsellors/`, `/articles/` and each article/profile. Normal navigation loads those documents. Legacy `/#/...` links redirect to the new URLs. The included `.htaccess` provides a fallback for future database-generated URLs.

## Design and assets

Original Nilaha layouts and graphics, inspired by support-first information architecture rather than Refuge branding or copied content. The support hub uses icons and compact service panels rather than stock-photo marketing sections. Typography uses Google Fonts with system fallbacks. No analytics or advertising scripts are included, but hosts may maintain access logs.

### Hostinger Git deployment without a Node build

The `webapp` branch contains the compiled public website at its root, including `/calculator/`. For the Git deployment screen that only clones files and installs Composer dependencies, choose **branch `webapp`** and retain `public_html` as the destination. Do not point that setup at `main`, which contains React source files.

GitHub Actions builds and tests pushes to `main`, then updates `webapp`. If Hostinger auto-deployment is disabled, redeploy that branch in hPanel after the workflow completes. Static deployment keeps intake disabled; server-backed support requests still require the separately configured Node service.

To publish the static branch manually from a trusted source checkout:

```sh
npm run build
node scripts/publish-static.mjs --push
```


## Utility navigation and motion

The public homepage is a service hub rather than a promotional landing page: direct actions, working official helpline links, search and practical resources. Desktop navigation uses a sidebar; mobile uses stacked homepage actions, a full hamburger navigation menu, and a return-to-hub link on inner pages. Individual pages are pre-rendered at build time and hydrated for interactive filters and forms. GSAP/ScrollTrigger provides subtle one-time fade-up reveals, enabled only when browser capabilities are available and reduced motion is not requested. In-page links use native smooth scrolling, with an instant-scroll reduced-motion alternative. There is no custom scroll hijacking. Calculator files remain separate at `/calculator/`, but public navigation and search no longer promote this future feature.


### Page transitions

Internal page links use a short curved charcoal curtain, with the destination title and a slight outgoing-page lift. The next page starts covered via a short-lived sessionStorage marker and reveals its pre-rendered content. This remains normal multi-page document navigation. The marker contains only a public destination path, label and timestamp; no form or contact data is retained. A bounded fallback releases the curtain if the new page script fails. Phone/SMS/email links, quick exit, new-tab clicks, same-page anchors, the calculator, and reduced-motion preferences bypass the decorative delay. Browser Back/forward cache restoration resets the curtain.

### Homepage introduction

Direct visits and returns to `/` display the Nilaha mark, wordmark and statement “Your voice matters. Your next step is yours.” before the curved curtain reveals the support hub. The full introduction takes about 2.4 seconds and includes a visible Skip intro button. Reduced-motion preferences bypass it, and the homepage is visible without JavaScript. Other routes keep the shorter destination-title transition. No visit tracking or personal information is stored for the intro.
