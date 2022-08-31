import { describe, it } from 'mocha';
import { expect } from 'chai';

import parse from '../src/parse.js';



const console = globalThis.console;

describe('Testing "preferBigIntString" option', () => {
	if(!BigInt) { return console.error('No native BigInt. Test is break...'); }


	const input = '{ "key": 12345678901234567 }';

	it('Should show that the key is of type bigint', done => {
		const result = parse(input);

		expect(typeof result.key).to.equal('bigint');


		done();
	});

	it('Should show that key is of type string, when preferBigIntString option is true', done => {
		const result = parse(input, undefined, { preferBigIntString: true });

		expect(typeof result.key).to.equal('string');


		done();
	});
});
