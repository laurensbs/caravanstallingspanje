import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-data';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return { title: 'Artikel niet gevonden' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://caravanstalling-spanje.com/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      images: [{ url: post.image, width: 800, height: 500, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
