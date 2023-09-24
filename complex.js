import {
	NAN,
	INFINITY,
	ZERO,
	ONE_HALF,
	NEG_ONE,
	ONE,
	TWO,
	THREE,
	FOUR,
	TEN,
	PI_OVER_TWO,
	E,
} from './constants.js';

/**
 * Arbitrary-precision complex numbers, implemented as a wrapper around Decimal.js.
 */
export default class Complex {
	constructor(real, imaginary) {
		this.real = mJS.bignumber(real);
		this.imaginary = mJS.bignumber(imaginary);
	}

	// convert a value to a complex number
	static convertToComplex(v) {
		if (v instanceof Complex) {
			return v;
		}

		return new Complex(v, ZERO);
	}

	// compare two complex numbers
	static equals(c1, c2) {
		return c1.real.equals(c2.real) && c1.imaginary.equals(c2.imaginary);
	}

	// approximate two complex numbers
	static approxEquals(c1, c2) {
		return c1.real.sub(c2.real).abs().lessThan('1e-6') && c1.imaginary.sub(c2.imaginary).abs().lessThan('1e-6');
	}

	static add(c1, c2) {
		c1 = Complex.convertToComplex(c1);
		c2 = Complex.convertToComplex(c2);

		return new Complex(c1.real.add(c2.real), c1.imaginary.add(c2.imaginary));
	}

	static subtract(c1, c2) {
		c1 = Complex.convertToComplex(c1);
		c2 = Complex.convertToComplex(c2);

		return new Complex(c1.real.sub(c2.real), c1.imaginary.sub(c2.imaginary));
	}

	static multiply(c1, c2) {
		c1 = Complex.convertToComplex(c1);
		c2 = Complex.convertToComplex(c2);

		const real = mJS.add(c1.imaginary.mul(c2.imaginary).neg(), c1.real.mul(c2.real));
		const imaginary = mJS.add(c1.imaginary.mul(c2.real), c1.real.mul(c2.imaginary));

		return new Complex(real, imaginary);
	}

	static divide(c1, c2) {
		c1 = Complex.convertToComplex(c1);
		c2 = Complex.convertToComplex(c2);

		const denominatorSum = mJS.add(c2.real.pow(TWO), c2.imaginary.pow(TWO));
		const real = mJS.add(c1.real.mul(c2.real), c1.imaginary.mul(c2.imaginary)).div(denominatorSum);
		const imaginary = mJS.subtract(c1.imaginary.mul(c2.real), c1.real.mul(c2.imaginary)).div(denominatorSum);

		return new Complex(real, imaginary);
	}

	// formula taken from https://mathworld.wolfram.com/ComplexExponentiation.html
	static exponent(c, p) {
		c = Complex.convertToComplex(c);
		p = Complex.convertToComplex(p);

		// imaginary number raised to integer power test
		if (c.real.equals(ZERO) && p.imaginary.equals(ZERO) && p.real.isInt()) {
			const pow = c.imaginary.pow(p.real);
			if (p.real.mod(FOUR).equals(ZERO)) {
				return new Complex(pow, ZERO);
			} else if (p.real.add(ONE).mod(FOUR).equals(ZERO)) {
				return new Complex(ZERO, NEG_ONE.mul(pow));
			} else if (p.real.mod(TWO).equals(ZERO)) {
				return new Complex(NEG_ONE.mul(pow), ZERO);
			} else if (p.real.add(THREE).mod(FOUR).equals(ZERO)) {
				return new Complex(ZERO, pow);
			}
		}

		const r = c.mod();
		const cArg = c.arg();

		const leftFactor = r.pow(p.real).mul(E.pow(p.imaginary.mul(cArg).neg()));
		const ratio = mJS.add(p.real.mul(cArg), p.imaginary.mul(ln(r.pow(TWO))).div(TWO));

		const real = mJS.cos(ratio).mul(leftFactor);
		const imaginary = mJS.sin(ratio).mul(leftFactor);

		return new Complex(real, imaginary);
	}

	static sqrt(c) {
		c = Complex.convertToComplex(c);

		if (c.imaginary.equals(ZERO)) {
			if (c.real.greaterThanOrEqualTo(ZERO)) {
				return new Complex(c.real.sqrt(), ZERO);
			} else {
				return new Complex(ZERO, c.real.abs().sqrt());
			}
		} else {
			return Complex.exponent(c, ONE_HALF);
		}
	}

	// returns modulus / absolute value of complex number (magnitude as if it's a vector)
	mod() {
		return mJS.hypot(this.real, this.imaginary);
	}

	// returns the argument of a complex number
	arg() {
		return mJS.atan2(this.imaginary, this.real);
	}

	// returns the conjugate of a complex number
	conj() {
		return new Complex(this.real, this.imaginary.neg());
	}

	static log(c, b = TEN) {
		c = Complex.convertToComplex(c);
		b = Complex.convertToComplex(b);
		return Complex.divide(Complex.ln(c), Complex.ln(b));
	}

	static ln(c) {
		c = Complex.convertToComplex(c);
		return new Complex(ln(c.mod()), c.arg());
	}

	static lerp(c1, c2, t) {
		c1 = Complex.convertToComplex(c1);
		c2 = Complex.convertToComplex(c2);
		const ratio = ONE.sub(t);

		return new Complex(mJS.add(ratio.mul(c1.real), t.mul(c2.real)), mJS.add(ratio.mul(c1.imaginary), t.mul(c2.imaginary)));
	}

	static sigRound(c, d = ONE) {
		c = Complex.convertToComplex(c);
		return new Complex(siground(c.real, d), siground(c.imaginary, d));
	}

	static round(c, s = ONE) {
		c = Complex.convertToComplex(c);
		return new Complex(round(c.real, s), round(c.imaginary, s));
	}

	static ceil(c, s = ONE) {
		c = Complex.convertToComplex(c);
		return new Complex(ceil(c.real, s), ceil(c.imaginary, s));
	}

	static floor(c, s = ONE) {
		c = Complex.convertToComplex(c);
		return new Complex(floor(c.real, s), floor(c.imaginary, s));
	}

	static sin(c) {
		c = Complex.convertToComplex(c);
		return new Complex(mJS.sin(c.real).mul(cosh(c.imaginary)), mJS.cos(c.real).mul(sinh(c.imaginary)));
	}

	static cos(c) {
		c = Complex.convertToComplex(c);
		return new Complex(mJS.cos(c.real).mul(cosh(c.imaginary)), mJS.sin(c.real).mul(sinh(c.imaginary)).neg());
	}

	static tan(c) {
		return Complex.divide(Complex.sin(c), Complex.cos(c));
	}

	static csc(c) {
		return Complex.divide(ONE, Complex.sin(c));
	}

	static sec(c) {
		return Complex.divide(ONE, Complex.cos(c));
	}

	static cot(c) {
		return Complex.divide(ONE, Complex.tan(c));
	}

	// formula from http://mathonweb.com/help_ebook/html/complex_funcs.htm
	static asin(c) {
		c = Complex.convertToComplex(c);

		const realPos = ONE.add(c.real).pow(TWO);
		const realNeg = ONE.sub(c.real).pow(TWO);

		const imSquared = c.imaginary.pow(TWO);

		const leftSquared = mJS.sqrt(realPos.add(imSquared));
		const rightSquared = mJS.sqrt(realNeg.add(imSquared));

		const a = mJS.divide(mJS.subtract(leftSquared, rightSquared), TWO);
		const b = mJS.divide(mJS.add(leftSquared, rightSquared), TWO);

		const result = new Complex(mJS.asin(a), ln(mJS.add(b, mJS.sqrt(b.pow(TWO).sub(ONE)))));

		if (c.imaginary.lessThan(ZERO) || (c.real.greaterThan(ZERO) && c.imaginary.lessThanOrEqualTo(ZERO))) {
			result.imaginary.s = -1;
		}

		return result;
	}

	static acos(c) {
		return Complex.subtract(PI_OVER_TWO, Complex.asin(c));
	}

	static atan(c) {
		c = Complex.convertToComplex(c);

		const realSquared = c.real.pow(TWO);
		const imSquared = c.imaginary.pow(TWO);

		return new Complex(atan2(c.real.mul(TWO), ONE.sub(realSquared).sub(imSquared)).div(TWO), ln(mJS.divide(realSquared.add(mJS.pow(ONE.add(c.imaginary), TWO)), realSquared.add(mJS.pow(ONE.sub(c.imaginary), TWO)))).div(FOUR));
	}

	static acsc(c) {
		return Complex.asin(Complex.divide(ONE, c));
	}

	static asec(c) {
		return Complex.acos(Complex.divide(ONE, c));
	}

	static acot(c) {
		return Complex.atan(Complex.divide(ONE, c));
	}

	static sinh(c) {
		c = Complex.convertToComplex(c);
		return new Complex(sinh(c.real).mul(mJS.cos(c.imaginary)), cosh(c.real).mul(mJS.sin(c.imaginary)));
	}

	static cosh(c) {
		c = Complex.convertToComplex(c);
		return new Complex(cosh(c.real).mul(mJS.cos(c.imaginary)), sinh(c.real).mul(mJS.sin(c.imaginary)));
	}

	static tanh(c) {
		return Complex.divide(Complex.sinh(c), Complex.cosh(c));
	}

	static csch(c) {
		return Complex.divide(ONE, Complex.sinh(c));
	}

	static sech(c) {
		return Complex.divide(ONE, Complex.cosh(c));
	}

	static coth(c) {
		return Complex.divide(ONE, Complex.tanh(c));
	}

	// from https://mathworld.wolfram.com/InverseHyperbolicSine.html
	static asinh(c) {
		c = Complex.convertToComplex(c);
		const result = Complex.multiply(Complex.neg_i, Complex.asin(Complex.multiply(Complex.i, c)));

		if (c.real.equals(ZERO) && c.imaginary.lessThan(ZERO)) {
			result.real.s = -1;
		} else {
			result.real.s = c.real.s;
		}

		result.imaginary.s = c.imaginary.s;

		return result;
	}

	// from https://mathworld.wolfram.com/InverseHyperbolicCosine.html
	static acosh(c) {
		return Complex.multiply(Complex.divide(Complex.exponent(Complex.subtract(c, ONE), ONE_HALF), Complex.exponent(Complex.subtract(ONE, c), ONE_HALF)), Complex.acos(c));
	}

	// from https://mathworld.wolfram.com/InverseHyperbolicTangent.html
	static atanh(c) {
		return Complex.multiply(Complex.neg_i, Complex.atan(Complex.multiply(Complex.i, c)));
	}

	// from complex.js
	static acsch(c) {
		c = Complex.convertToComplex(c);

		if (c.imaginary.equals(ZERO)) {
			return new Complex(c.real.equals(ZERO) ? c.INFINITY : ln(c.real.add(mJS.sqrt(c.real.pow(TWO).add(ONE)))), ZERO);
		} else {
			const sum = mJS.add(mJS.pow(c.real, TWO), mJS.pow(c.imaginary, TWO));
			return Complex.asinh(new Complex(c.real.div(sum), c.imaginary.div(sum).neg()));
		}
	}

	// from complex.js
	static asech(c) {
		c = Complex.convertToComplex(c);

		const imIsZero = c.imaginary.equals(ZERO);
		if (c.real.equals(ZERO) && imIsZero) {
			return Complex.infinity;
		} else {
			const sum = mJS.add(mJS.pow(c.real, TWO), mJS.pow(c.imaginary, TWO));
			const result = Complex.acosh(new Complex(c.real.div(sum), c.imaginary.div(sum).neg()));

			if (c.real.lessThan(ZERO) && imIsZero) {
				result.imaginary.s = 1;
			}

			return result;
		}
	}

	// from complex.js
	static acoth(c) {
		c = Complex.convertToComplex(c);

		if (c.real.equals(ZERO) && c.imaginary.equals(ZERO)) {
			return new Complex(ZERO, PI_OVER_TWO);
		} else {
			const sum = mJS.add(mJS.pow(c.real, TWO), mJS.pow(c.imaginary, TWO));
			return Complex.atanh(new Complex(c.real.div(sum), c.imaginary.div(sum).neg()));
		}
	}

	clone() {
		return new Complex(this.real, this.imaginary);
	}

	equals(c) {
		c = Complex.convertToComplex(c);
		return this.real.equals(c.real) && this.imaginary.equals(c.imaginary);
	}

	// return an object representing the complex number in javascript's number type
	toNumber() {
		return {real: this.real.toNumber(), imaginary: this.imaginary.toNumber()};
	}

	toJSON() {
		return {real: this.real.toString(), imaginary: this.imaginary.toString()};
	}

	toString() {
		if (this.imaginary.equals(ZERO)) {
			return this.real.toString();
		} else {
			let str = 'i';

			if (this.imaginary.equals(NEG_ONE)) {
				str = '-i';
			} else if (!this.imaginary.equals(ONE)) {
				str = this.imaginary + str;
			}

			if (this.real.greaterThan(ZERO)) {
				str += '+' + this.real;
			} else if (this.real.lessThan(ZERO)) {
				str += '-' + this.real.abs();
			}

			return str;
		}
	}
}

Object.defineProperty(Complex, 'i', {value: new Complex(ZERO, ONE)});
Object.defineProperty(Complex, 'neg_i', {value: new Complex(ZERO, NEG_ONE)});
Object.defineProperty(Complex, 'zero', {value: new Complex(ZERO, ZERO)});
Object.defineProperty(Complex, 'nan', {value: new Complex(NAN, NAN)});
Object.defineProperty(Complex, 'infinity', {value: new Complex(INFINITY, INFINITY)});
