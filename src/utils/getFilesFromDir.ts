import fs from 'fs/promises';
import path from 'path';
import { documents } from '~/data/documents';

export function getFileNameFromPath(path: string) {
  return decodeURIComponent(path).split('/').pop() || '';
}

const DOCUMENTS_DIR = 'files';

let checked: Promise<void> | undefined;

/**
 * Fails the build when a PDF in public/files is missing from src/data/documents.ts (it would never be listed)
 * or a registry entry points at a file that does not exist (a broken link).
 */
export function assertDocumentsMatchFiles() {
  checked ??= (async () => {
    const publicDir = path.join(process.cwd(), 'public');
    const entries = await fs.readdir(path.join(publicDir, DOCUMENTS_DIR), { recursive: true, withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
      .map((entry) => '/' + path.relative(publicDir, path.join(entry.parentPath, entry.name)).normalize('NFC'));
    const registered = new Set(documents.map((document) => document.href.normalize('NFC')));

    const unlisted = files.filter((file) => !registered.has(file));
    const missing = [...registered].filter((href) => !files.includes(href));
    if (unlisted.length || missing.length) {
      throw new Error(
        [
          unlisted.length && `Add these files to src/data/documents.ts:\n  ${unlisted.join('\n  ')}`,
          missing.length && `These src/data/documents.ts entries have no file:\n  ${missing.join('\n  ')}`,
        ]
          .filter(Boolean)
          .join('\n')
      );
    }
  })();
  return checked;
}
