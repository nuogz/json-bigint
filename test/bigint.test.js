import { describe, it } from 'mocha';
import { expect } from 'chai';

import parse from '../src/parse.js';
import stringify from '../src/stringify.js';



const console = globalThis.console;

describe('Testing bigint support', () => {
	if(!BigInt) { return console.error('No native BigInt. Test is break...'); }


	const input = '{"big":9223372036854775807,"small":123}';

	it('Should show classic JSON.parse lacks bigint support', done => {
		const object = JSON.parse(input);

		expect(object.small.toString(), 'string from small int value').to.equal('123');
		expect(object.big.toString(), 'string from big int value').to.not.equal('9223372036854775807');


		const output = JSON.stringify(object);

		expect(output).to.not.equal(input);


		done();
	});

	it('Should show JSONBigInt does support bigint parse/stringify roundtrip', done => {
		const object = parse(input);

		expect(object.small.toString(), 'string from small int value').to.equal('123');
		expect(object.big.toString(), 'string from big int value').to.equal('9223372036854775807');
		expect(typeof object.big, 'typeof big int type').to.equal('bigint');


		const output = stringify(object);

		expect(output).to.equal(input);


		done();
	});
});
