import type { PaginateFunction } from 'astro';
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Product } from '~/types';
import { APP_PRODUCT, SITE } from '~/config';
import { cleanSlug, PRODUCT_BASE, PRODUCT_PERMALINK_PATTERN, TYPE_BASE } from './permalinks';

const productNames = {
  valves: 'Клапаны',
  conveyors: 'Конвейеры',
};

const generatePermalink = async ({
  id,
  slug,
  publishDate,
  type,
}: {
  id: string;
  slug: string;
  publishDate: Date;
  type: string | undefined;
}) => {
  const year = String(publishDate.getFullYear()).padStart(4, '0');
  const month = String(publishDate.getMonth() + 1).padStart(2, '0');
  const day = String(publishDate.getDate()).padStart(2, '0');
  const hour = String(publishDate.getHours()).padStart(2, '0');
  const minute = String(publishDate.getMinutes()).padStart(2, '0');
  const second = String(publishDate.getSeconds()).padStart(2, '0');

  const permalink = PRODUCT_PERMALINK_PATTERN.replace('%slug%', slug)
    .replace('%id%', id)
    .replace('%type%', type || '')
    .replace('%year%', year)
    .replace('%month%', month)
    .replace('%day%', day)
    .replace('%hour%', hour)
    .replace('%minute%', minute)
    .replace('%second%', second);

  const segments = permalink.split('/').filter(Boolean);

  return '/' + segments.join('/') + (SITE.trailingSlash ? '/' : '');
};

const getNormalizedProduct = async (product: CollectionEntry<'product'>): Promise<Product> => {
  const { id, data } = product;
  const { Content, remarkPluginFrontmatter } = await render(product);

  const {
    title,
    excerpt,
    image,
    type: rawType,
    dimensions,
    weight,
    author,
    publishDate,
    updateDate,
    draft = false,
    metadata = {},
  } = data;

  const slug = cleanSlug(id);
  const type = rawType
    ? {
        slug: cleanSlug(rawType),
        title: productNames[rawType] || rawType,
      }
    : undefined;

  const publishDateObj = publishDate ? new Date(publishDate) : new Date();
  const updateDateObj = updateDate ? new Date(updateDate) : publishDateObj;

  const permalink = await generatePermalink({
    id,
    slug,
    publishDate: publishDateObj,
    type: type?.slug,
  });

  return {
    id: id,
    slug: slug,
    permalink: permalink,

    title: title,
    excerpt: excerpt,
    image: image,

    type: type,
    dimensions: dimensions,
    weight: weight,
    author: author,

    draft: draft,

    metadata,

    Content: Content,
    content: undefined,

    publishDate: publishDateObj,
    updateDate: updateDateObj,

    readingTime: remarkPluginFrontmatter?.readingTime,
  };
};

const load = async function (): Promise<Array<Product>> {
  const products = await getCollection('product');
  const normalizedProducts = products.map(async (product) => await getNormalizedProduct(product));

  const results = (await Promise.all(normalizedProducts))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((product) => !product.draft);

  return results;
};

let _products: Array<Product>;

/** */
export const isProductEnabled = APP_PRODUCT.isEnabled;
export const isProductListRouteEnabled = APP_PRODUCT.list.isEnabled;
export const isProductRouteEnabled = APP_PRODUCT.product.isEnabled;
export const isProductTypeRouteEnabled = APP_PRODUCT.type.isEnabled;

export const productListRobots = APP_PRODUCT.list.robots;
export const productRobots = APP_PRODUCT.product.robots;
export const productTypeRobots = APP_PRODUCT.type.robots;

export const productsPerPage = APP_PRODUCT?.productsPerPage;

/** */
export const fetchProducts = async (): Promise<Array<Product>> => {
  if (!_products) {
    _products = await load();
  }

  return _products;
};

/** */
export const findProductsBySlugs = async (slugs: Array<string>): Promise<Array<Product>> => {
  if (!Array.isArray(slugs)) return [];

  const products = await fetchProducts();

  return slugs.reduce(function (r: Array<Product>, slug: string) {
    products.some(function (product: Product) {
      return slug === product.slug && r.push(product);
    });
    return r;
  }, []);
};

/** */
export const findProductsByIds = async (ids: Array<string>): Promise<Array<Product>> => {
  if (!Array.isArray(ids)) return [];

  const products = await fetchProducts();

  return ids.reduce(function (r: Array<Product>, id: string) {
    products.some(function (product: Product) {
      return id === product.id && r.push(product);
    });
    return r;
  }, []);
};

/** */
export const findLatestProducts = async ({ count }: { count?: number }): Promise<Array<Product>> => {
  const _count = count || 4;
  const products = await fetchProducts();

  return products ? products.slice(0, _count) : [];
};

/** */
export const getStaticPathsProductList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isProductEnabled || !isProductListRouteEnabled) return [];
  return paginate(await fetchProducts(), {
    params: { product: PRODUCT_BASE || undefined },
    pageSize: productsPerPage,
  });
};

/** */
export const getStaticPathsProduct = async () => {
  if (!isProductEnabled || !isProductRouteEnabled) return [];

  const products = await fetchProducts();
  return products.map((product) => {
    const type = product.type?.slug || 'valves';
    const slug = product.slug;

    return {
      params: {
        type,
        slug,
      },
      props: {
        product,
      },
    };
  });
};

/** */
export const getStaticPathsProductType = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isProductEnabled || !isProductTypeRouteEnabled) return [];

  const products = await fetchProducts();
  const types = {};
  products.map((product) => {
    if (product.type?.slug) {
      types[product.type?.slug] = product.type;
    }
  });

  return Array.from(Object.keys(types)).flatMap((typeSlug) =>
    paginate(
      products.filter((product) => product.type?.slug && typeSlug === product.type?.slug),
      {
        params: { type: typeSlug },
        pageSize: productsPerPage,
        props: { type: types[typeSlug] },
      }
    )
  );
};
