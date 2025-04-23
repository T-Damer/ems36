import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = load(readFileSync(join(__dirname, 'config.yaml'), 'utf-8')) as any;

export const APP_PRODUCT = config.apps.product;
