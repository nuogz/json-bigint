/**
 * @callback Replacer
 * @param {any} this
 * @param {string} key
 * @param {any} value
 */
/**
 * @param {any} value
 * @param {Replacer} [replacer]
 * @param {string|number} [space]
 */
export default function stringify(value: any, replacer?: Replacer | undefined, space?: string | number | undefined): any;
export type Replacer = (this: any, key: string, value: any) => any;
