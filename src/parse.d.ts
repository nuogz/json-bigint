/**
 * @callback Reviver
 * @param {any} this
 * @param {string} key
 * @param {any} value
 */
/**
 * Converts a JavaScript Object Notation (JSON) string into an object.
 * @param {string} text A valid JSON string.
 * @param {Reviver} reviver A function that transforms the results. This function is called for each member of the object.
 * If a member contains nested objects, the nested objects are transformed before the parent object is.
 * @param {Object} option
 * @param {boolean} [option.preferParseAsBigInt]
 * @param {boolean} [option.preferBigIntString]
 * @param {('error'|'ignore'|'preserve')} [option.protoAction]
 * @param {('error'|'ignore'|'preserve')} [option.constructorAction]
 */
export default function parse(text: string, reviver: Reviver, option: {
    preferParseAsBigInt?: boolean | undefined;
    preferBigIntString?: boolean | undefined;
    protoAction?: "error" | "preserve" | "ignore" | undefined;
    constructorAction?: "error" | "preserve" | "ignore" | undefined;
}): any;
export type Reviver = (this: any, key: string, value: any) => any;
