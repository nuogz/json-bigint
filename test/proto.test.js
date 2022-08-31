import { describe, it } from 'mocha';
import { expect } from 'chai';

import parse from '../src/parse.js';



const console = globalThis.console;

describe('__proto__ and constructor assignment', () => {
	if(!BigInt) { return console.error('No native BigInt. Test is break...'); }


	it('Should set __proto__ property but not a prototype if protoAction is set to preserve', done => {
		const object1 = parse('{ "__proto__": 1000000000000000 }', null, { protoAction: 'preserve' });

		expect(Object.getPrototypeOf(object1)).to.equal(Object.prototype);


		const object2 = parse('{ "__proto__": { "admin": true } }', null, { protoAction: 'preserve' });

		expect(object2.admin).to.equal(true);
		expect(Object.getPrototypeOf(object2).admin).to.equal(true);


		done();
	});

	it('Should throw an exception if protoAction set to invalid value', done => {
		expect(() => parse('{ "__proto__": 1000000000000000 }', undefined, { protoAction: 'invalid value' }))
			.to.throw('Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed invalid value');


		done();
	});

	it('Should throw an exception if constructorAction set to invalid value', done => {
		expect(() => parse('{ "__proto__": 1000000000000000 }', undefined, { constructorAction: 'invalid value' }))
			.to.throw('Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed invalid value');


		done();
	});

	it('Should throw an exception if protoAction set to error and there is __proto__ property', done => {
		expect(() => parse('{ "\\u005f_proto__": 1000000000000000 }', undefined, { protoAction: 'error' }))
			.to.throw('Object contains forbidden prototype property');


		done();
	});

	it('Should throw an exception if constructorAction set to error and there is constructor property', done => {
		expect(() => parse('{ "constructor": 1000000000000000 }', undefined, { constructorAction: 'error' }))
			.to.throw('Object contains forbidden constructor property');


		done();
	});

	it('Should ignore __proto__ property if protoAction is set to ignore', done => {
		const object = parse(
			'{ "__proto__": 1000000000000000, "a" : 42, "nested": { "__proto__": false, "b": 43 } }',
			undefined,
			{ protoAction: 'ignore' }
		);

		expect(Object.getPrototypeOf(object)).to.equal(Object.prototype);
		expect(object).to.deep.equal({ a: 42, nested: { b: 43 } });


		done();
	});

	it('Should ignore constructor property if constructorAction is set to ignore', done => {
		const object = parse(
			'{ "constructor": 1000000000000000, "a" : 42, "nested": { "constructor": false, "b": 43 } }',
			undefined,
			{ constructorAction: 'ignore' }
		);

		expect(object).to.deep.equal({ a: 42, nested: { b: 43 } });


		done();
	});
});
