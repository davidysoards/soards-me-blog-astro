import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/posts' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		subtitle: z.string().optional(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		tags: z.array(z.string()).optional(),
		canonicalLink: z.string().optional(),
		heroImage: z.string().optional(),
	}),
});

export const collections = { posts };
