# Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Korean, project-led PM portfolio as a static Astro site with a PDF export, deployed to GitHub Pages at `https://l-yoon.github.io/`.

**Architecture:** Static Astro site. Content lives in an Astro content collection (`projects`) plus a small `site` data file, fully decoupled from layout. A single-scroll main page links to per-project detail pages; a dedicated `/print` route reuses the same content for an A4 PDF generated via Playwright. Deployed by a GitHub Actions Pages workflow.

**Tech Stack:** Astro 5 (static), Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme`), Pretendard (CDN dynamic-subset), Playwright for PDF.

> **Verification note:** This is a visual content site, so steps verify by *building* (`npm run build` must succeed with zero errors), *type-checking* (`npx astro check`), and *visual inspection* on the dev server — not unit tests. Where behavior is checkable (PDF generation, page count), the step gives the exact command and expected result.

> **Content note:** Tasks 2–6 build the site with **placeholder/sample content** so layout can be verified independently. Real content is gathered in the **interview phase (Task 7)** and dropped into Markdown — no component changes needed.

---

### Task 1: Scaffold Astro + Tailwind v4 + Pretendard

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro` (temporary smoke-test page, replaced in Task 5)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "l-yoon-portfolio",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@astrojs/check": "^0.9.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://l-yoon.github.io',
  // User site (root) — no `base` needed.
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
*.log
```

- [ ] **Step 5: Create `src/styles/global.css`** (Tailwind import, Pretendard, teal theme tokens)

```css
@import "tailwindcss";

/* Pretendard — Korean web standard, dynamic subset (only loads used glyphs) */
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css");

@theme {
  --font-sans: "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  /* Neutral light palette */
  --color-ink: #1a1d1c;       /* near-black text */
  --color-muted: #5c6360;     /* secondary text */
  --color-line: #e3e6e4;      /* borders/dividers */
  --color-surface: #fafbfb;   /* near-white background */

  /* Muted teal accent */
  --color-accent: #2f8a7e;
  --color-accent-soft: #e6f1ef;
}

html {
  background: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-sans);
  scroll-behavior: smooth;
}
```

- [ ] **Step 6: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
interface Props { title: string; description?: string; }
const { title, description = '웹/앱 프로젝트를 오프쇼어 개발팀과 함께 끝까지 책임지는 PM' } = Astro.props;
---
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body class="mx-auto max-w-3xl px-6 py-12 leading-relaxed">
    <slot />
  </body>
</html>
```

- [ ] **Step 7: Create a temporary `src/pages/index.astro` smoke test**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Min Yoon — PM Portfolio">
  <h1 class="text-3xl font-bold text-[var(--color-ink)]">Scaffold OK</h1>
  <p class="mt-2 text-[var(--color-accent)]">Pretendard + Tailwind + teal accent working.</p>
</BaseLayout>
```

- [ ] **Step 8: Install and verify the build**

Run: `npm install`
Then: `npm run build`
Expected: build completes with `0 errors`, a `dist/index.html` is produced.
Then: `npm run dev` and open the local URL — confirm Korean text renders in Pretendard and "Scaffold OK" shows with the teal accent line.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Scaffold Astro + Tailwind v4 + Pretendard"
```

---

### Task 2: Content collection schema + sample content

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/gran-seoul.md` (sample/placeholder)
- Create: `src/content/projects/talking-club.md` (sample/placeholder)
- Create: `src/content/projects/songyeon.md` (sample/placeholder, non-featured)
- Create: `src/data/site.ts`

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    period: z.string(),          // e.g. "2024.03 – 2025.06"
    role: z.string(),            // your role
    team: z.string(),            // team size/composition
    domain: z.string(),          // short domain label for cards
    stack: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    summary: z.string(),         // one-line impact
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    thumbnail: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
});

export const collections = { projects };
```

- [ ] **Step 2: Create sample featured project `src/content/projects/gran-seoul.md`**

```markdown
---
name: 그랑서울
period: "2024.01 – 진행중"
role: 프로젝트 매니저 (PM)
team: 오프쇼어 개발 5명 + 디자이너 1명
domain: 빌딩 관리 시스템
stack: ["PHP", "NestJS", "React", "MySQL", "GCP"]
featured: true
order: 1
summary: 빌딩 관리 통합 시스템의 기획·개발·QA를 오프쇼어 팀과 함께 끝까지 책임
metrics:
  - { label: "관리 세대", value: "TBD" }
  - { label: "온타임 배포", value: "TBD" }
links: []
---

## 배경
(인터뷰에서 채움)

## 한 일
(인터뷰에서 채움)

## 결과
(인터뷰에서 채움)

## 회고
(인터뷰에서 채움)
```

- [ ] **Step 3: Create sample featured project `src/content/projects/talking-club.md`**

```markdown
---
name: 토킹클럽
period: "2023.06 – 진행중"
role: 프로젝트 매니저 (PM)
team: 오프쇼어 개발 4명
domain: 영어 교육 플랫폼
stack: ["NestJS", "Next.js", "Flutter", "MySQL"]
featured: true
order: 2
summary: 웹·앱·백엔드 멀티 플랫폼 영어 교육 서비스 동시 운영 및 배포 관리
metrics:
  - { label: "플랫폼", value: "Web · App · API" }
links: []
---

## 배경
(인터뷰에서 채움)

## 한 일
(인터뷰에서 채움)

## 결과
(인터뷰에서 채움)

## 회고
(인터뷰에서 채움)
```

- [ ] **Step 4: Create sample non-featured project `src/content/projects/songyeon.md`**

```markdown
---
name: 송연돌봄
period: "2024.05 – 진행중"
role: 프로젝트 매니저 (PM)
team: 오프쇼어 개발 3명
domain: 노인 돌봄 서비스
stack: ["Kotlin", "Spring Boot", "AWS"]
featured: false
order: 5
summary: 안드로이드 네이티브 + Spring Boot 기반 노인 돌봄 앱 출시 관리
links: []
---

(카드 전용 프로젝트 — 상세 페이지 없음)
```

- [ ] **Step 5: Create `src/data/site.ts`** (hero/about/contact)

```ts
export const site = {
  name: '윤민 (Min Yoon)',
  tagline: '웹/앱 프로젝트를 오프쇼어 개발팀과 함께 끝까지 책임지는 PM',
  headline: [
    { label: '담당 프로젝트', value: 'TBD' },
    { label: '관리 개발 인원', value: 'TBD' },
    { label: '경력', value: 'TBD' },
  ],
  competencies: ['프로젝트 관리', '오프쇼어 팀 리딩', '클라이언트 커뮤니케이션', 'QA·배포 관리', '멀티 프로젝트 오케스트레이션'],
  about: '(인터뷰에서 채움)',
  timeline: [] as { period: string; org: string; role: string }[],
  contact: {
    email: 'chanmin@divii.com',
    links: [] as { label: string; url: string }[],
  },
};
```

- [ ] **Step 6: Verify the schema loads**

Run: `npx astro check`
Expected: `0 errors`. (If a frontmatter field mismatches the schema, `astro check` reports the exact file and field.)
Run: `npm run build`
Expected: build succeeds; no content-collection errors in output.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add projects content collection, sample content, and site data"
```

---

### Task 3: Main-page section components

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/MetricStrip.astro`
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/FeaturedProject.astro`
- Create: `src/components/About.astro`
- Create: `src/components/Contact.astro`

> Each component is self-contained, takes typed props, and uses the teal theme tokens. No data fetching inside components — the page passes data in (Task 5).

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
interface Props { name: string; tagline: string; email: string; }
const { name, tagline, email } = Astro.props;
---
<header class="border-b border-[var(--color-line)] pb-10">
  <h1 class="text-4xl font-bold tracking-tight">{name}</h1>
  <p class="mt-3 text-lg text-[var(--color-muted)]">{tagline}</p>
  <a href={`mailto:${email}`} class="mt-5 inline-block rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white">연락하기</a>
</header>
```

- [ ] **Step 2: Create `src/components/MetricStrip.astro`**

```astro
---
interface Props {
  headline: { label: string; value: string }[];
  competencies: string[];
}
const { headline, competencies } = Astro.props;
---
<section class="mt-10 grid gap-6">
  <dl class="grid grid-cols-3 gap-4">
    {headline.map((m) => (
      <div>
        <dt class="text-sm text-[var(--color-muted)]">{m.label}</dt>
        <dd class="text-2xl font-bold text-[var(--color-accent)]">{m.value}</dd>
      </div>
    ))}
  </dl>
  <ul class="flex flex-wrap gap-2">
    {competencies.map((c) => (
      <li class="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-sm text-[var(--color-accent)]">{c}</li>
    ))}
  </ul>
</section>
```

- [ ] **Step 3: Create `src/components/FeaturedProject.astro`** (rich preview block, links to detail)

```astro
---
interface Props {
  name: string; role: string; period: string; summary: string;
  stack: string[]; href: string; thumbnail?: string;
}
const { name, role, period, summary, stack, href, thumbnail } = Astro.props;
---
<article class="border-b border-[var(--color-line)] py-8">
  <div class="flex items-baseline justify-between gap-4">
    <h3 class="text-xl font-semibold"><a href={href} class="hover:text-[var(--color-accent)]">{name}</a></h3>
    <span class="shrink-0 text-sm text-[var(--color-muted)]">{period}</span>
  </div>
  <p class="mt-1 text-sm text-[var(--color-muted)]">{role}</p>
  <p class="mt-3">{summary}</p>
  <ul class="mt-3 flex flex-wrap gap-2">
    {stack.map((s) => <li class="text-xs text-[var(--color-muted)] border border-[var(--color-line)] rounded px-2 py-0.5">{s}</li>)}
  </ul>
  <a href={href} class="mt-4 inline-block text-sm font-medium text-[var(--color-accent)]">자세히 보기 →</a>
</article>
```

- [ ] **Step 4: Create `src/components/ProjectCard.astro`** (short card for non-featured)

```astro
---
interface Props { name: string; domain: string; role: string; summary: string; }
const { name, domain, role, summary } = Astro.props;
---
<article class="rounded-lg border border-[var(--color-line)] p-4">
  <div class="flex items-baseline justify-between">
    <h4 class="font-semibold">{name}</h4>
    <span class="text-xs text-[var(--color-muted)]">{domain}</span>
  </div>
  <p class="mt-1 text-sm text-[var(--color-muted)]">{role}</p>
  <p class="mt-2 text-sm">{summary}</p>
</article>
```

- [ ] **Step 5: Create `src/components/About.astro`**

```astro
---
interface Props {
  about: string;
  timeline: { period: string; org: string; role: string }[];
}
const { about, timeline } = Astro.props;
---
<section class="mt-12 border-t border-[var(--color-line)] pt-10">
  <h2 class="text-2xl font-bold">소개</h2>
  <p class="mt-4 whitespace-pre-line">{about}</p>
  {timeline.length > 0 && (
    <ol class="mt-6 space-y-3">
      {timeline.map((t) => (
        <li class="flex gap-4">
          <span class="w-32 shrink-0 text-sm text-[var(--color-muted)]">{t.period}</span>
          <span><strong>{t.org}</strong> — {t.role}</span>
        </li>
      ))}
    </ol>
  )}
</section>
```

- [ ] **Step 6: Create `src/components/Contact.astro`**

```astro
---
interface Props { email: string; links: { label: string; url: string }[]; }
const { email, links } = Astro.props;
---
<footer class="mt-12 border-t border-[var(--color-line)] pt-8 text-sm">
  <a href={`mailto:${email}`} class="text-[var(--color-accent)]">{email}</a>
  {links.length > 0 && (
    <ul class="mt-2 flex gap-4">
      {links.map((l) => <li><a href={l.url} class="text-[var(--color-muted)] hover:text-[var(--color-accent)]">{l.label}</a></li>)}
    </ul>
  )}
</footer>
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: `0 errors`. (Components are unused until Task 5, but build must still type-check their props interfaces.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add main-page section components"
```

---

### Task 4: Case-study detail pages

**Files:**
- Create: `src/pages/projects/[...slug].astro`

- [ ] **Step 1: Create the dynamic detail route**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects', (p) => p.data.featured);
  return projects.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const d = entry.data;
---
<BaseLayout title={`${d.name} — Min Yoon`}>
  <a href="/" class="text-sm text-[var(--color-accent)]">← 포트폴리오</a>
  <header class="mt-4 border-b border-[var(--color-line)] pb-6">
    <h1 class="text-3xl font-bold">{d.name}</h1>
    <p class="mt-2 text-[var(--color-muted)]">{d.role} · {d.period} · {d.team}</p>
    <ul class="mt-3 flex flex-wrap gap-2">
      {d.stack.map((s) => <li class="text-xs border border-[var(--color-line)] rounded px-2 py-0.5">{s}</li>)}
    </ul>
    {d.metrics.length > 0 && (
      <dl class="mt-4 flex flex-wrap gap-6">
        {d.metrics.map((m) => (
          <div><dt class="text-xs text-[var(--color-muted)]">{m.label}</dt><dd class="text-lg font-bold text-[var(--color-accent)]">{m.value}</dd></div>
        ))}
      </dl>
    )}
  </header>
  <article class="prose-portfolio mt-8 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-3">
    <Content />
  </article>
</BaseLayout>
```

- [ ] **Step 2: Verify detail pages generate**

Run: `npm run build`
Expected: build output lists generated routes including `/projects/gran-seoul/` and `/projects/talking-club/` (the two `featured: true` samples), but NOT `/projects/songyeon/`.
Then `npm run dev`, open `/projects/gran-seoul/` — header renders name/role/stack, and the Markdown body (배경/한 일/결과/회고 headings) shows.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add case-study detail pages for featured projects"
```

---

### Task 5: Assemble the main page

**Files:**
- Modify: `src/pages/index.astro` (replace the Task 1 smoke test)

- [ ] **Step 1: Replace `src/pages/index.astro` with the full assembly**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../data/site';
import Hero from '../components/Hero.astro';
import MetricStrip from '../components/MetricStrip.astro';
import FeaturedProject from '../components/FeaturedProject.astro';
import ProjectCard from '../components/ProjectCard.astro';
import About from '../components/About.astro';
import Contact from '../components/Contact.astro';

const all = await getCollection('projects');
const featured = all.filter((p) => p.data.featured).sort((a, b) => a.data.order - b.data.order);
const others = all.filter((p) => !p.data.featured).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title={`${site.name} — PM Portfolio`}>
  <Hero name={site.name} tagline={site.tagline} email={site.contact.email} />
  <MetricStrip headline={site.headline} competencies={site.competencies} />

  <section class="mt-12">
    <h2 class="text-2xl font-bold">주요 프로젝트</h2>
    {featured.map((p) => (
      <FeaturedProject
        name={p.data.name} role={p.data.role} period={p.data.period}
        summary={p.data.summary} stack={p.data.stack}
        href={`/projects/${p.id}/`} thumbnail={p.data.thumbnail}
      />
    ))}
  </section>

  {others.length > 0 && (
    <section class="mt-12">
      <h2 class="text-2xl font-bold">그 외 프로젝트</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        {others.map((p) => (
          <ProjectCard name={p.data.name} domain={p.data.domain} role={p.data.role} summary={p.data.summary} />
        ))}
      </div>
    </section>
  )}

  <About about={site.about} timeline={site.timeline} />
  <Contact email={site.contact.email} links={site.contact.links} />
</BaseLayout>
```

- [ ] **Step 2: Verify the full page renders**

Run: `npm run dev`, open `/`.
Expected: hero → metric strip (with TBD values + teal competency tags) → 주요 프로젝트 (그랑서울, 토킹클럽 with "자세히 보기" links) → 그 외 프로젝트 (송연돌봄 card) → 소개 → contact footer. Clicking a featured project navigates to its detail page.
Run: `npm run build` → `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Assemble main portfolio page"
```

---

### Task 6: Print route + print stylesheet

**Files:**
- Create: `src/pages/print.astro`
- Modify: `src/styles/global.css` (append `@media print` rules)

- [ ] **Step 1: Create `src/pages/print.astro`** (all content, document order, no nav)

```astro
---
import { getCollection, render } from 'astro:content';
import { site } from '../data/site';
import '../styles/global.css';

const all = await getCollection('projects');
const featured = all.filter((p) => p.data.featured).sort((a, b) => a.data.order - b.data.order);
const rendered = await Promise.all(featured.map(async (e) => ({ d: e.data, Content: (await render(e)).Content })));
---
<!doctype html>
<html lang="ko">
  <head><meta charset="utf-8" /><title>{site.name} — Portfolio</title></head>
  <body class="print-doc mx-auto max-w-3xl px-8 py-10">
    <h1 class="text-3xl font-bold">{site.name}</h1>
    <p class="mt-2 text-[var(--color-muted)]">{site.tagline}</p>
    <p class="mt-1 text-sm">{site.contact.email}</p>

    {rendered.map(({ d, Content }) => (
      <section class="project-block mt-8">
        <h2 class="text-2xl font-bold">{d.name}</h2>
        <p class="text-sm text-[var(--color-muted)]">{d.role} · {d.period} · {d.team}</p>
        <p class="text-sm">{d.stack.join(' · ')}</p>
        <div class="mt-3 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-2"><Content /></div>
      </section>
    ))}
  </body>
</html>
```

- [ ] **Step 2: Append print rules to `src/styles/global.css`**

```css
@media print {
  @page { size: A4; margin: 18mm 16mm; }
  html { background: #fff; }
  a { color: inherit; text-decoration: none; }
  .project-block { break-before: page; break-inside: avoid; }
  .project-block:first-of-type { break-before: avoid; }
  h2, h3 { break-after: avoid; }
}
```

- [ ] **Step 3: Verify the print route**

Run: `npm run dev`, open `/print`.
Expected: a continuous document — header + each featured project, no nav/buttons. In the browser print preview (Cmd+P), each project starts on its own A4 page after the first.
Run: `npm run build` → `0 errors`, `dist/print/index.html` exists.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add /print route and A4 print stylesheet"
```

---

### Task 7: Interview phase — fill real content

> **Interactive.** This task is run with the user, not autonomously. No component changes — only edits to `src/content/projects/*.md` and `src/data/site.ts`.

- [ ] **Step 1: Basics** — collect display name, contact links, final one-line positioning, and the 3–4 headline numbers. Update `src/data/site.ts` (`name`, `tagline`, `headline`, `competencies`, `contact.links`).

- [ ] **Step 2: Featured projects** — for each project the user wants featured (set `featured: true`, `order`): collect 배경 / 한 일 / 결과(수치) / 회고 and fill the Markdown body + frontmatter `metrics`, `team`, `period`, `summary`. Create new `.md` files for any project not yet present (Centerfield, Mobigen GBA).

- [ ] **Step 3: Card projects** — for non-featured projects, fill frontmatter (`domain`, `role`, `summary`); body can stay minimal.

- [ ] **Step 4: About** — fill `about` and `timeline` in `src/data/site.ts`.

- [ ] **Step 5: Verify & commit**

Run: `npm run build` → `0 errors`; visually confirm `/` and each detail page show real content with no remaining "(인터뷰에서 채움)" or "TBD" placeholders.
```bash
git add -A
git commit -m "Fill portfolio content from interview"
```

---

### Task 8: PDF generation

**Files:**
- Create: `scripts/generate-pdf.mjs`
- Modify: `package.json` (add `pdf` script + optional Playwright dev dep)

> The repo can generate the PDF reproducibly with Playwright. During this session, the Playwright **MCP** can also drive `/print` directly without adding a dependency — the script exists so the user can regenerate it themselves later.

- [ ] **Step 1: Add `scripts/generate-pdf.mjs`**

```js
import { chromium } from 'playwright';

const URL = process.env.PRINT_URL ?? 'http://localhost:4321/print';
const OUT = 'public/min-yoon-portfolio.pdf';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
});
await browser.close();
console.log(`Wrote ${OUT}`);
```

- [ ] **Step 2: Add scripts to `package.json`**

Add to `"scripts"`: `"pdf": "node scripts/generate-pdf.mjs"`.
Add to `"devDependencies"`: `"playwright": "^1.48.0"` (only if generating locally; CI/MCP can skip).

- [ ] **Step 3: Generate the PDF**

Run (in one terminal): `npm run preview` (serves the built site on `:4321`).
Run (in another): `npm run pdf` (first time: `npx playwright install chromium`).
Expected: `public/min-yoon-portfolio.pdf` is written; open it and confirm A4 pages, one project per page, Korean text intact, teal accents present.
Fallback (no Playwright): open `/print` in Chrome → Cmd+P → Save as PDF.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add PDF generation script and export portfolio PDF"
```

---

### Task 9: GitHub Pages deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

> **Outward-facing:** creating/pushing the public remote publishes the openly-named client work. Confirm with the user before this task's push step.

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Confirm with user, then create the public remote and push**

```bash
git branch -M main
gh repo create l-yoon.github.io --public --source=. --remote=origin --push
```

- [ ] **Step 3: Enable Pages via Actions**

In the repo on GitHub: Settings → Pages → Build and deployment → Source = **GitHub Actions**. (The workflow then runs on push.)
Expected: the Actions run succeeds; `https://l-yoon.github.io/` serves the portfolio within a minute or two of the run completing.

- [ ] **Step 4: Verify live**

Open `https://l-yoon.github.io/` and `https://l-yoon.github.io/print` — confirm both render. Confirm the PDF link (if linked from the page) downloads.

---

## Notes / Optional follow-ups
- **Custom domain:** add a `public/CNAME` file with the domain and configure DNS when ready.
- **Screenshots:** add project images under `public/` and reference via `thumbnail`; ensure no confidential UI is exposed.
- **OG/meta:** add an Open Graph image + tags for nicer link previews when sharing the URL with recruiters.
