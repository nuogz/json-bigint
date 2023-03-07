import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { loadI18NResource } from '@nuogz/i18n';



loadI18NResource('@nuogz/json-bigint', resolve(dirname(fileURLToPath(import.meta.url)), 'locale'));



export { default as parse } from './src/parse.js';
export { default as stringify } from './src/stringify.js';
