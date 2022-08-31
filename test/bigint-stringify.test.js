import { describe, it } from 'mocha';
import { expect } from 'chai';

import stringify from '../src/stringify.js';



const console = globalThis.console;

describe('Testing native BigInt support: stringify', () => {
	if(!BigInt) { return console.error('No native BigInt. Test is break...'); }


	it('Should show JSONBigInt can stringify native BigInt', done => {
		const object = {
			// We cannot use n-literals - otherwise older NodeJS versions fail on this test
			big: eval('123456789012345678901234567890n'),
			small: -42,
			bigConstructed: BigInt(1),
			smallConstructed: Number(2),
		};

		expect(typeof object.big, 'typeof big int type').to.equal('bigint');
		expect(object.small.toString(), 'string from small int value').to.equal('-42');
		expect(object.big.toString(), 'string from big int value').to.equal('123456789012345678901234567890');


		const output = stringify(object);

		expect(output).to.equal(
			'{' +
			'"big":123456789012345678901234567890,' +
			'"small":-42,' +
			'"bigConstructed":1,' +
			'"smallConstructed":2' +
			'}'
		);


		done();
	});
});
