import type { CollectionEntry } from 'astro:content';
export type Post = CollectionEntry<'posts'>;
export const topics = [
	{ id: 'ai', label: 'AI', tags: ['ai', 'claude-code', 'pi', 'jev', 'workflow'] },
	{
		id: 'design',
		label: 'Design',
		tags: ['design', 'ux', 'figma', 'fonts', 'comics', 'ecommerce'],
	},
	{
		id: 'front-end',
		label: 'Front-end',
		tags: ['vue', 'react', 'css', 'tailwind', 'svg', 'radix', 'formspree', 'typescript', 'nuxt'],
	},
	{
		id: 'infra',
		label: 'Infra',
		tags: [
			'docker',
			'vps',
			'linux',
			'caddy',
			'nginx',
			'postgres',
			'pgvector',
			'mysql',
			'django',
			'python',
			's3',
			'php',
			'wordpress',
			'acf',
			'netlify',
			'macos',
			'development',
		],
	},
];
export const postTopics = (post: Post) =>
	topics.filter((topic) => post.data.tags?.some((tag) => topic.tags.includes(tag)));
export const postSlug = (post: Post) => post.id.replace(/\/index$/, '');
export const postUrl = (post: Post) => `/posts/${postSlug(post)}/`;
export const newestFirst = (a: Post, b: Post) =>
	b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
