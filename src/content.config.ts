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
