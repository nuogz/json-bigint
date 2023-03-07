import { TT } from '@nuogz/i18n';



const T = TT('@nuogz/json-bigint');



// eslint-disable-next-line no-control-regex, no-misleading-character-class
const escapable = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

// table of character substitutions
const meta = {
	'"': '\\"',
	'\\': '\\\\',
	'\b': '\\b',
	'\f': '\\f',
	'\n': '\\n',
	'\r': '\\r',
	'\t': '\\t',
};

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.
const quote = string => {
	escapable.lastIndex = 0;

	const textQuote = escapable.test(string)
		? string.replace(escapable, a => meta[a] ?? ('\\u' + a.charCodeAt(0).toString(16).padStart(4, '0')))
		: string;

	return `"${textQuote}"`;
};


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
export default function stringify(value, replacer, space) {
	let gap = '';


	let indent = '';
	if(typeof space == 'number') {
		indent = ' '.repeat(space);
	}
	else if(typeof space == 'string') {
		indent = space;
	}

	// If there is a replacer, it must be a function or an array.
	// Otherwise, throw an error.
	if(
		replacer && typeof replacer != 'function' &&
		!(replacer instanceof Array)
	) {
		throw Error(T('invalidReplacer', {value}));
	}


	const str = (key, holder) => {
		let length;
		let mind = gap;
		let partial;
		let value = holder[key];


		// If the value has a toJSON method, call it to obtain a replacement value.
		if(typeof value?.toJSON == 'function') {
			value = value.toJSON(key);
		}


		// If we were called with a replacer function, then call the replacer to
		// obtain a replacement value.
		if(typeof replacer == 'function') {
			value = replacer.call(holder, key, value);
		}


		// What happens next depends on the value's type.
		switch(typeof value) {
			case 'string': {
				return quote(value);
			}

			// JSON numbers must be finite. Encode non-finite numbers as null.
			case 'number': {
				return isFinite(value) ? String(value) : 'null';
			}

			// If the value is a boolean or null, convert it to a string. Note:
			// typeof null does not produce 'null'. The case is included here in
			// the remote chance that this gets fixed someday.
			case 'boolean':
			case 'null':
			case 'bigint': {
				return String(value);
			}


			// If the type is 'object', we might be dealing with an object or an array or
			// null.
			// Due to a specification blunder in ECMAScript, typeof null is 'object',
			// so watch out for that case.
			case 'object': {
				if(!value) { return 'null'; }


				// Make an array to hold the partial results of stringifying this object value.
				gap += indent;
				partial = [];


				// Is the value an array?
				if(value instanceof Array) {
					// The value is an array. Stringify every element. Use null as a placeholder
					// for non-JSON values.
					length = value.length;
					for(let i = 0; i < length; i++) {
						partial[i] = str(i, value) || 'null';
					}

					// Join all of the elements together, separated with commas, and wrap them in
					// brackets.
					const v = partial.length == 0
						? '[]'
						: gap
							? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
							: '[' + partial.join(',') + ']';
					gap = mind;

					return v;
				}

				// If the replacer is an array, use it to select the members to be stringified.
				if(replacer && typeof replacer == 'object') {
					length = replacer.length;
					for(let i = 0; i < length; i++) {
						if(typeof replacer[i] == 'string') {
							const k = replacer[i];
							const v = str(k, value);
							if(v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				}
				else {
					// Otherwise, iterate through all of the keys in the object.
					Object.keys(value).forEach(k => {
						const v = str(k, value);

						if(v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					});
				}


				// Join all of the member texts together, separated with commas,
				// and wrap them in braces.
				const v = partial.length == 0
					? '{}'
					: gap
						? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
						: '{' + partial.join(',') + '}';

				gap = mind;

				return v;
			}
		}
	};

	// Make a fake root object containing our value under the key of ''.
	// Return the result of stringifying the value.
	return str('', { '': value });
}
