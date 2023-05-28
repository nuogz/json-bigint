import { TT, loadI18NResource } from '@nuogz/i18n';


import en from '../locale/en.json';
import zh from '../locale/zh.json';



loadI18NResource('@nuogz/json-bigint', { en, zh });


export const T = TT('@nuogz/json-bigint');
