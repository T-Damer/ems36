import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = load(readFileSync(join(__dirname, 'config.yaml'), 'utf-8')) as any;

export const SITE = config.site;
export const METADATA = config.metadata;
export const I18N = config.i18n;
export const PAGES = config.pages;
export const APPS = config.apps;
export const ANALYTICS = config.analytics;
export const UI = config.ui;

export const APP_PRODUCT = config.apps.product;
