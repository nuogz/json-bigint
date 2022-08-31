import { describe, it } from 'mocha';
import { expect } from 'chai';

import parse from '../src/parse.js';
import stringify from '../src/stringify.js';



const console = globalThis.console;

describe('Testing native BigInt support: parse', () => {
	if(!BigInt) { return console.error('No native BigInt. Test is break...'); }


	const input = '{"big":92233720368547758070,"small":123,"deci":1234567890.0123456,"shortExp":1.79e+308,"longExp":1.7976931348623157e+308}';

	it('Should show JSONBigInt does support parsing native BigInt', done => {
		const object = parse(input);

		expect(typeof object.small, 'small int type').to.equal('number');
		expect(object.small.toString(), 'small int value').to.equal('123');

		expect(typeof object.big, 'big int type').to.equal('bigint');
		expect(object.big.toString(), 'big int value').to.equal('92233720368547758070');


		done();
	});

	it('Should show JSONBigInt does support forced parsing to native BigInt', done => {
		const object = parse(input, undefined, { preferParseAsBigInt: true });

		expect(typeof object.small, 'small int type').to.equal('bigint');
		expect(object.small.toString(), 'small int value').to.equal('123');

		expect(typeof object.big, 'big int value').to.equal('bigint');
		expect(object.big.toString(), 'big int type').to.equal('92233720368547758070');


		done();
	});

	it('Should show JSONBigInt does support decimal and scientific notation parse/stringify roundtrip', done => {
		const object = parse(input);

		expect(typeof object.deci, 'decimal number type').to.equal('number');
		expect(object.deci.toString(), 'decimal number').to.equal('1234567890.0123456');

		expect(typeof object.shortExp, 'short exponential number type').to.equal('number');
		expect(object.shortExp.toString(), 'short exponential number').to.equal('1.79e+308');

		expect(typeof object.longExp, 'long exponential number type').to.equal('number');
		expect(object.longExp.toString(), 'long exponential number').to.equal('1.7976931348623157e+308');


		const output = stringify(object);

		expect(output).to.equal(input);


		done();
	});

	it('Should show JSONBigInt does support native Bigint parse/stringify roundtrip', done => {
		const object = parse(input);
		const output = stringify(object);

		expect(output).to.equal(input);


		done();
	});

	it('Should show JSONBigInt does support native Bigint parse/stringify roundtrip when BigInt is forced', done => {
		const object = parse(input, undefined, { preferParseAsBigInt: true });
		const output = stringify(object);

		expect(output).to.equal(input);


		done();
	});
});
