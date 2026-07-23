import { getCollection } from 'astro:content';
import { SITE_URL } from '../consts';

export async function GET() {
  const posts = await getCollection('blog');
  const projects = await getCollection('projects');

  const pages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/about', changefreq: 'monthly', priority: '0.8' },
    { url: '/blog', changefreq: 'daily', priority: '0.9' },
    { url: '/projects', changefreq: 'monthly', priority: '0.8' },
    { url: '/drawings', changefreq: 'monthly', priority: '0.6' },
    { url: '/pictures', changefreq: 'monthly', priority: '0.6' },
    ...posts.map(post => ({
      url: `/blog/${post.id}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: post.data.pubDate.toISOString().split('T')[0],
    })),
    ...projects.map(project => ({
      url: `/projects/${project.id}`,
      changefreq: 'yearly',
      priority: '0.6',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ''}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
