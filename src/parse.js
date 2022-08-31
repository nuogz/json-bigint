const charsEscape = {
	'"': '"',
	'\\': '\\',
	'/': '/',
	b: '\b',
	f: '\f',
	n: '\n',
	r: '\r',
	t: '\t',
};

const suspectProtoRx = /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/;
const suspectConstructorRx = /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/;


const caseError = (message, indexChar, text) => {
	throw {
		name: 'SyntaxError',
		message: message,
		at: indexChar,
		text,
	};
};


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
export default function parse(text, reviver, option) {
	const optionFinal = {
		preferParseAsBigInt: Boolean(option?.preferParseAsBigInt ?? false),
		preferBigIntString: Boolean(option?.preferBigIntString ?? false),
		protoAction: String(option?.protoAction ?? 'error'),
		constructorAction: String(option?.constructorAction ?? 'error'),
	};

	if(
		optionFinal.protoAction != 'error' &&
		optionFinal.protoAction != 'ignore' &&
		optionFinal.protoAction != 'preserve'
	) {
		throw new Error(
			`Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed ${optionFinal.protoAction}`
		);
	}

	if(
		optionFinal.constructorAction != 'error' &&
		optionFinal.constructorAction != 'ignore' &&
		optionFinal.constructorAction != 'preserve'
	) {
		throw new Error(
			`Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed ${optionFinal.constructorAction}`
		);
	}



	const stringText = String(text);

	/** The index of the current character */
	let indexChar = 0;
	/**  The current character */
	let charNow = ' ';

	/** skip whitespace */
	const skipWhite = () => {
		while(charNow && charNow <= ' ') {
			next();
		}
	};

	const next = c => {
		// If a c parameter is provided, verify that it matches the current character.
		if(c && c !== charNow) {
			caseError(`Expected "${c}" instead of "${charNow}"`, charNow, stringText);
		}

		// Get the next character. When there are no more characters,
		// return the empty string.

		charNow = stringText.charAt(indexChar);
		indexChar += 1;

		return charNow;
	};


	const parseNumber = () => {
		let stringNumber = '';

		if(charNow == '-') {
			stringNumber = '-';
			next('-');
		}

		while(charNow >= '0' && charNow <= '9') {
			stringNumber += charNow;
			next();
		}

		if(charNow == '.') {
			stringNumber += '.';

			while(next() && charNow >= '0' && charNow <= '9') {
				stringNumber += charNow;
			}
		}

		if(charNow == 'e' || charNow == 'E') {
			stringNumber += charNow;
			next();
			if(charNow == '-' || charNow == '+') {
				stringNumber += charNow;
				next();
			}
			while(charNow >= '0' && charNow <= '9') {
				stringNumber += charNow;
				next();
			}
		}


		const number = Number(stringNumber);


		if(!isFinite(number)) {
			caseError('Bad number', charNow, stringText);
		}

		if(Number.isSafeInteger(number)) {
			return optionFinal.preferParseAsBigInt ? BigInt(number) : number;
		}

		// Number with fractional part should be treated as number(double) including big integers in scientific notation, i.e 1.79e+308
		return optionFinal.preferBigIntString
			? stringNumber
			: /[.eE]/.test(stringNumber)
				? number
				: BigInt(stringNumber);
	};

	// When parsing for string values, we must look for " and \ characters.
	const parseString = () => {
		let string = '';

		if(charNow == '"') {
			let indexStart = indexChar;

			while(next()) {
				if(charNow == '"') {
					if(indexChar - 1 > indexStart) { string += stringText.substring(indexStart, indexChar - 1); }

					next();

					return string;
				}

				if(charNow == '\\') {
					if(indexChar - 1 > indexStart) { string += stringText.substring(indexStart, indexChar - 1); }

					next();

					if(charNow == 'u') {
						let uffff = 0;

						for(let i = 0; i < 4; i++) {
							const hex = parseInt(next(), 16);

							if(!isFinite(hex)) { break; }

							uffff = uffff * 16 + hex;
						}

						string += String.fromCharCode(uffff);
					}
					else if(typeof charsEscape[charNow] == 'string') {
						string += charsEscape[charNow];
					}
					else {
						break;
					}

					indexStart = indexChar;
				}
			}
		}

		caseError('Bad string', charNow, stringText);
	};



	// true, false, or null.
	const parseWord = () => {
		switch(charNow) {
			case 't': {
				next('t'); next('r'); next('u'); next('e');

				return true;
			}
			case 'f': {
				next('f'); next('a'); next('l'); next('s'); next('e');

				return false;
			}
			case 'n': {
				next('n'); next('u'); next('l'); next('l');

				return null;
			}
		}

		caseError(`Unexpected word '${charNow}'`, charNow, stringText);
	};


	const parseArray = () => {
		const array = [];

		if(charNow == '[') {
			next('[');
			skipWhite();

			if(charNow == ']') {
				next(']');

				return array;
			}

			while(charNow) {
				array.push(parseValue());
				skipWhite();

				if(charNow == ']') {
					next(']');

					return array;
				}

				next(',');
				skipWhite();
			}
		}

		caseError('Bad array', charNow, stringText);
	};

	const parseObject = () => {
		const object = {};

		if(charNow == '{') {
			next('{');
			skipWhite();

			if(charNow == '}') {
				next('}');

				return object;
			}

			while(charNow) {
				const key = parseString();

				skipWhite();
				next(':');

				if(suspectProtoRx.test(key)) {
					if(optionFinal.protoAction == 'error') {
						caseError('Object contains forbidden prototype property', charNow, stringText);
					}
					else if(optionFinal.protoAction == 'ignore') {
						parseValue();
					}
					else {
						object[key] = parseValue();
					}
				}
				else if(suspectConstructorRx.test(key)) {
					if(optionFinal.constructorAction == 'error') {
						caseError('Object contains forbidden constructor property', charNow, stringText);
					}
					else if(optionFinal.constructorAction == 'ignore') {
						parseValue();
					}
					else {
						object[key] = parseValue();
					}
				}
				else {
					object[key] = parseValue();
				}

				skipWhite();

				if(charNow == '}') {
					next('}');

					return object;
				}

				next(',');
				skipWhite();
			}
		}

		caseError('Bad object', charNow, stringText);
	};

	/** Place holder for the value function */
	const parseValue = () => {
		skipWhite();

		switch(charNow) {
			case '{': {
				return parseObject();
			}
			case '[': {
				return parseArray();
			}
			case '"': {
				return parseString();
			}
			case '-': {
				return parseNumber();
			}
			default: {
				return charNow >= '0' && charNow <= '9' ? parseNumber() : parseWord();
			}
		}
	};


	const result = parseValue();

	skipWhite();
	if(charNow) { caseError('Syntax error', charNow, stringText); }


	if(typeof reviver == 'function') {
		const walk = (holder, key) => {
			const value = holder[key];

			if(value && typeof value == 'object') {
				Object.keys(value).forEach(k => {
					const v = walk(value, k);

					if(v !== undefined) {
						value[k] = v;
					}
					else {
						delete value[k];
					}
				});
			}

			return reviver.call(holder, key, value);
		};

		return walk({ '': result }, '');
	}


	return result;
}
