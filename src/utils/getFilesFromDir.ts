import fs from 'fs/promises';
import path from 'path';

export function getFileNameFromPath(path: string) {
  return decodeURIComponent(path).split('/').pop() || '';
}

export default async function getPublicFiles(dir: string) {
  const publicDir = path.join(process.cwd(), 'public', dir);
  const files = await fs.readdir(publicDir);
  return files.map((file) => `/${path.join(dir, file)}`);
}
