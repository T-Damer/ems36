import path from 'node:path';
import sharp from 'sharp';

/** Real dimensions of an image in /public (build time only); empty when it can't be read. */
export const publicImageSize = async (src: string): Promise<{ width?: number; height?: number }> => {
  try {
    const { width, height } = await sharp(path.join(process.cwd(), 'public', decodeURIComponent(src))).metadata();
    return { width, height };
  } catch {
    return {};
  }
};
