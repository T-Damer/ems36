import path from 'node:path';
import sharp from 'sharp';

// Blur-up placeholders without client-side decoding: a ~100-byte 16px WebP is inlined as the element's
// background, and the browser's smooth upscaling turns it into a soft blur until the real media paints.
const cache = new Map<string, Promise<string | undefined>>();

/** Data URI of a tiny copy of an image in /public (build time only); undefined when it can't be read. */
export const placeholderFor = (src?: string): Promise<string | undefined> => {
  if (!src || !src.startsWith('/')) return Promise.resolve(undefined);
  let result = cache.get(src);
  if (!result) {
    result = sharp(path.join(process.cwd(), 'public', decodeURIComponent(src)))
      .resize(16, 16, { fit: 'inside' })
      .webp({ quality: 40 })
      .toBuffer()
      .then((buffer) => `data:image/webp;base64,${buffer.toString('base64')}`)
      .catch(() => undefined);
    cache.set(src, result);
  }
  return result;
};

/** Inline style that shows the placeholder behind an <img>/<video> while it loads. */
export const placeholderStyle = async (src?: string) => {
  const uri = await placeholderFor(src);
  return uri ? `background-image:url(${uri});background-size:cover;background-position:center` : undefined;
};
