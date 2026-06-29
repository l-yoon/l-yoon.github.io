# Portfolio — Design Spec

Date: 2026-06-29
Owner: Min Yoon (Chanmin) — GitHub `l-yoon`

## Goal

A personal PM portfolio supporting a 이직 (job change). Positioning: a
delivery-focused PM who runs multiple web/app projects end-to-end, managing
offshore development teams and Korean clients.

## Decisions

| Area | Decision |
|------|----------|
| Format | Astro website (source of truth) + PDF export for applications |
| Language | Korean only |
| Client identity | Named openly (Gran Seoul, Centerfield, Talking Club, Songyeon Dolbom, Mobigen GBA) — confirmed no blocking NDA |
| Narrative structure | Project-led (Approach A) |
| Accent color | Muted teal, on a neutral light palette |
| Tech | Astro (static), Tailwind v4 (Vite plugin, CSS-first), Pretendard font |
| Hosting | GitHub Pages — user site at `https://l-yoon.github.io/` |
| Repo | Public repo `l-yoon.github.io`; local-first, public remote pushed only at deploy time |
| Deploy | GitHub Actions Pages workflow (`withastro/action`) |
| Content sourcing | Section-by-section interview |

## Information Architecture

### Main page (single scroll)
1. Hero — name, one-line positioning, primary contact/CTA
2. At-a-glance strip — 3–4 headline numbers + 4–5 competency tags
3. Featured case studies — 2–3 strongest projects as rich preview blocks, each
   linking to a detail page
4. Other projects — remaining projects as short cards (name, domain, role, one outcome)
5. About / 경력 — short bio, career timeline, grouped skills
6. Contact — email + links

### Case-study detail page (one per featured project)
- Header: name, period, role, team composition, stack
- 배경 → 한 일 (specific contribution) → 결과 (outcome + metrics) → 회고
- Screenshots/visuals where allowed

### Print route (`/print`)
- Renders main summary + featured case studies in document order, no nav/interactive chrome
- Reuses the same content collections (no duplicate content)

## Content Model — Astro Content Collections

- `projects` collection: one Markdown/MDX file per project. Frontmatter:
  `name`, `period`, `role`, `team`, `stack[]`, `featured: boolean`, `metrics[]`,
  `thumbnail`, `links`. Body = 배경/한 일/결과/회고 prose.
- `site` config: hero text, bio, career timeline, contact links.
- `featured: true` → gets a detail page and a rich preview block; otherwise a short card.

## PDF Export

- `src/pages/print.astro` renders the print document.
- Print stylesheet: `@page { size: A4 }`, `break-before: page` per case study,
  `break-inside: avoid` on cards/metrics, forced light palette, screen-only elements hidden.
- File generation: Playwright loads `/print` and exports A4 PDF (`printBackground: true`).
  Manual Cmd+P → Save as PDF is the zero-tooling fallback.

## Interview Plan

1. Basics — display name, contact/links, one-line positioning, 3–4 headline numbers
2. Per project (featured first) — period, role, team, stack, then 배경/한 일/결과(수치)/회고
3. About — bio, career timeline, grouped skills

## Build Sequence

1. Scaffold Astro + Tailwind v4 + Pretendard; define content-collection schema
2. Build layout + components with placeholder content (hero, metric strip, project
   card, case-study layout, about, contact) in the teal palette
3. Run the interview; fill real content into Markdown
4. Add `/print` route + print stylesheet; wire Playwright PDF generation
5. Review pass; create + push public GitHub remote; enable Pages via Actions

## Open Items (resolved during interview)

- Which 2–3 projects are featured vs. card-only
- The headline metrics for the at-a-glance strip
- Custom domain (optional, later — CNAME step noted for when ready)
