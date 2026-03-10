import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    excerpt: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    readTime: z.number(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts };
