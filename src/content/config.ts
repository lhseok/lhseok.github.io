import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
    description: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    company: z.string().optional(),
    description: z.string().optional(),
    period: z.string(),
    thumbnail: z.string().optional(),
    header_image: z.string().optional(),
  }),
});

const drawings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/drawings' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string(),
  }),
});

const pictures = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pictures' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string(),
  }),
});

export const collections = { blog, projects, drawings, pictures };
