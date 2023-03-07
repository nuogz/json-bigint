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
export default function stringify(value: any, replacer?: Replacer, space?: string | number): any;
export type Replacer = (this: any, key: string, value: any) => any;
