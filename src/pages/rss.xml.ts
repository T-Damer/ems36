import { getRssString } from '@astrojs/rss';

import { SITE, METADATA, APP_BLOG } from 'astrowind:config';
import { fetchPosts } from '~/utils/blog';
import { getPermalink } from '~/utils/permalinks';
import { fetchProducts } from '~/utils/product';

export const GET = async () => {
  if (!APP_BLOG.isEnabled) {
    return new Response(null, {
      status: 404,
      statusText: 'Не найдено',
    });
  }

  const posts = await fetchPosts();
  const products = await fetchProducts();

  const postItems = posts.map((post) => ({
    link: getPermalink(post.permalink, 'post'),
    title: post.title,
    description: post.excerpt,
    pubDate: post.publishDate,
  }));
  const productItems = products.map((product) => ({
    link: getPermalink(product.permalink, 'product'),
    title: product.title,
    description: product.excerpt,
    pubDate: product.publishDate,
  }));

  const rss = await getRssString({
    title: `${SITE.name} Новости и Продукция`,
    description: METADATA?.description || '',
    site: import.meta.env.SITE,

    items: [...postItems, ...productItems],

    trailingSlash: SITE.trailingSlash,
  });

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
