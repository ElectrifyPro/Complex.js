import Decimal from 'decimal.js';
import {
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
	/**
	 * @param {Decimal.Value} re The real part. Defaults to 0.
	 * @param {Decimal.Value} im The imaginary part. Defaults to 0.
	 */
	constructor(re = ZERO, im = ZERO) {
		this.re = new Decimal(re);
		this.im = new Decimal(im);
	}

	/**
	 * Clones this complex number.
	 */
	clone() {
		return new Complex(this.re, this.im);
	}

	/**
	 * Compares this complex number to another complex number for equality.
	 * @param {Complex} other
	 */
	eq(other) {
		return this.re.eq(other.re) && this.im.eq(other.im);
	}

	/**
	 * Adds two complex numbers, returning a new complex number.
	 * @param {Complex} other
	 */
	add(other) {
		return new Complex(this.re.add(other.re), this.im.add(other.im));
	}

	/**
	 * Subtracts two complex numbers, returning a new complex number.
	 * @param {Complex} other
	 */
	sub(other) {
		return new Complex(this.re.sub(other.re), this.im.sub(other.im));
	}

	/**
	 * Multiplies two complex numbers, returning a new complex number.
	 * @param {Complex} other
	 */
	mul(other) {
		return new Complex(
			this.re.mul(other.re).sub(this.im.mul(other.im)),
			this.re.mul(other.im).add(this.im.mul(other.re)),
		);
	}

	/**
	 * Divides two complex numbers, returning a new complex number.
	 * @param {Complex} other
	 */
	div(other) {
		const denominatorSum = other.re.pow(TWO).add(other.im.pow(TWO));
		return new Complex(
			this.re.mul(other.re).add(this.im.mul(other.im)).div(denominatorSum),
			this.im.mul(other.re).sub(this.re.mul(other.im)).div(denominatorSum),
		);
	}

	/**
	 * Returns the reciprocal of this complex number, i.e. 1 / this.
	 */
	recip() {
		const denominatorSum = this.re.pow(TWO).add(this.im.pow(TWO));
		return new Complex(
			this.re.div(denominatorSum),
			this.im.neg().div(denominatorSum),
		);
	}

	/**
	 * Returns a new complex number whose value is this complex number, raised to the power of the given complex number.
	 * @param {Complex} other
	 */
	pow(other) {
		// derived from https://mathworld.wolfram.com/ComplexExponentiation.html

		// imaginary number raised to integer power test
		if (this.re.eq(ZERO) && other.im.eq(ZERO) && other.re.isInt()) {
			const pow = this.im.pow(other.re);
			if (other.re.mod(FOUR).eq(ZERO)) { // i^(4n) = 1
				return new Complex(pow, ZERO);
			} else if (other.re.add(ONE).mod(FOUR).eq(ZERO)) { // i^(4n + 1) = i
				return new Complex(ZERO, NEG_ONE.mul(pow));
			} else if (other.re.mod(TWO).eq(ZERO)) { // i^(2n) = -1
				return new Complex(NEG_ONE.mul(pow), ZERO);
			} else if (other.re.add(THREE).mod(FOUR).eq(ZERO)) { // i^(4n + 3) = -i
				return new Complex(ZERO, pow);
			}
		}

		const r = this.mod();
		const cArg = this.arg();

		const leftFactor = r.pow(other.re).mul(E.pow(other.im.mul(cArg).neg()));
		const ratio = other.re.mul(cArg).add(
			other.im.mul(r.pow(TWO).ln()).div(TWO)
		);

		return new Complex(
			ratio.cos().mul(leftFactor),
			ratio.sin().mul(leftFactor),
		);
	}

	/**
	 * Returns the square root of this complex number.
	 */
	sqrt() {
		if (this.im.eq(ZERO)) {
			if (this.re.gte(ZERO)) {
				return new Complex(this.re.sqrt());
			} else {
				return new Complex(ZERO, this.re.abs().sqrt());
			}
		} else {
			return this.pow(new Complex(ONE_HALF));
		}
	}

	/**
	 * Returns the modulus / absolute value of this complex number, i.e. the magnitude of the complex number.
	 */
	mod() {
		return Decimal.hypot(this.re, this.im);
	}

	/**
	 * Returns the argument of this complex number, i.e. the angle between the positive real axis and the vector representing this complex number.
	 */
	arg() {
		return Decimal.atan2(this.im, this.re);
	}

	/**
	 * Returns the complex conjugate of this complex number.
	 */
	conj() {
		return new Complex(this.re, this.im.neg());
	}

	/**
	 * Returns the logarithm base `n` of this complex number.
	 * @param {Complex} n The base of the logarithm. Defaults to 10.
	 */
	log(n = new Complex(TEN)) {
		return Complex.divide(this.ln(), n.ln());
	}

	/**
	 * Returns the natural logarithm of this complex number.
	 */
	ln() {
		return new Complex(this.mod().ln(), this.arg());
	}

	/**
	 * Linearly interpolates between this complex number and another complex number.
	 * @param {Complex} other
	 * @param {Decimal.Value} t The interpolation parameter.
	 */
	lerp(other, t) {
		const ratio = ONE.sub(t);
		return new Complex(
			ratio.mul(this.re).add(t.mul(other.re)),
			ratio.mul(this.im).add(t.mul(other.im)),
		);
	}

	/**
	 * Returns a complex number with the real and imaginary part rounded to `d` significant digits.
	 * @param {Decimal.Value} d
	 */
	toSignificantDigits(d) {
		return new Complex(
			this.re.toSignificantDigits(d),
			this.im.toSignificantDigits(d),
		);
	}

	/**
	 * Returns a complex number with the real and imaginary part rounded to the nearest integer.
	 */
	round() {
		return new Complex(
			this.re.round(),
			this.im.round(),
		);
	}

	/**
	 * Returns a complex number with the real and imaginary part rounded up to the nearest integer.
	 */
	ceil() {
		return new Complex(
			this.re.ceil(),
			this.im.ceil(),
		);
	}

	/**
	 * Returns a complex number with the real and imaginary part rounded down to the nearest integer.
	 */
	floor() {
		return new Complex(
			this.re.floor(),
			this.im.floor(),
		);
	}

	/**
	 * Returns the sine of this complex number.
	 */
	sin() {
		return new Complex(
			this.re.sin().mul(this.im.cosh()),
			this.re.cos().mul(this.im.sinh()),
		);
	}

	/**
	 * Returns the cosine of this complex number.
	 */
	cos() {
		return new Complex(
			this.re.cos().mul(this.im.cosh()),
			this.re.sin().mul(this.im.sinh()).neg(),
		);
	}

	/**
	 * Returns the tangent of this complex number.
	 */
	tan() {
		return this.sin().div(this.cos());
	}

	/**
	 * Returns the cosecant of this complex number.
	 */
	csc() {
		return this.sin().recip();
	}

	/**
	 * Returns the secant of this complex number.
	 */
	sec() {
		return this.cos().recip();
	}

	/**
	 * Returns the cotangent of this complex number.
	 */
	cot() {
		return this.tan().recip();
	}

	/**
	 * Returns the inverse sine of this complex number.
	 */
	asin() {
		// derived from http://mathonweb.com/help_ebook/html/complex_funcs.htm
		const rePositive = ONE.add(this.re).pow(TWO);
		const reNegative = ONE.sub(this.re).pow(TWO);

		const imSquared = this.im.pow(TWO);

		const leftSquared = rePositive.add(imSquared).sqrt();
		const rightSquared = reNegative.add(imSquared).sqrt();

		const a = leftSquared.sub(rightSquared).div(TWO);
		const b = leftSquared.add(rightSquared).div(TWO);
		const result = new Complex(
			a.asin(),
			b.add(
				b.pow(TWO).sub(ONE).sqrt()
			).ln(),
		);

		if (this.im.lessThan(ZERO) || (this.re.greaterThan(ZERO) && this.im.lessThanOrEqualTo(ZERO))) {
			result.im.s = -1;
		}

		return result;
	}

	/**
	 * Returns the inverse cosine of this complex number.
	 */
	acos() {
		return new Complex(PI_OVER_TWO).sub(this.asin());
	}

	/**
	 * Returns the inverse tangent of this complex number.
	 */
	atan() {
		const reSquared = this.re.pow(TWO);
		const imSquared = this.im.pow(TWO);

		return new Complex(
			Decimal.atan2(
				this.re.mul(TWO),
				ONE.sub(reSquared).sub(imSquared),
			).div(TWO),
			Decimal.div(
				reSquared.add(ONE.add(this.im).pow(TWO)),
				reSquared.add(ONE.sub(this.im).pow(TWO)),
			).ln().div(FOUR),
		);
	}

	/**
	 * Returns the inverse cosecant of this complex number.
	 */
	acsc() {
		return this.recip().asin();
	}

	/**
	 * Returns the inverse secant of this complex number.
	 */
	asec() {
		return this.recip().acos();
	}

	/**
	 * Returns the inverse cotangent of this complex number.
	 */
	acot() {
		return this.recip().atan();
	}

	/**
	 * Returns the hyperbolic sine of this complex number.
	 */
	sinh() {
		return new Complex(
			this.re.sinh().mul(this.im.cos()),
			this.re.cosh().mul(this.im.sin()),
		);
	}

	/**
	 * Returns the hyperbolic cosine of this complex number.
	 */
	cosh() {
		return new Complex(
			this.re.cosh().mul(this.im.cos()),
			this.re.sinh().mul(this.im.sin()),
		);
	}

	/**
	 * Returns the hyperbolic tangent of this complex number.
	 */
	tanh() {
		return this.sinh().div(this.cosh());
	}

	/**
	 * Returns the hyperbolic cosecant of this complex number.
	 */
	csch() {
		return this.sinh().recip();
	}

	/**
	 * Returns the hyperbolic secant of this complex number.
	 */
	sech() {
		return this.cosh().recip();
	}

	/**
	 * Returns the hyperbolic cotangent of this complex number.
	 */
	coth() {
		return this.tanh().recip();
	}

	/**
	 * Returns the inverse hyperbolic sine of this complex number.
	 */
	asinh() {
		// from https://mathworld.wolfram.com/InverseHyperbolicSine.html
		const result = this.mul(I).asin().mul(NEG_I);

		if (this.re.eq(ZERO) && this.im.lt(ZERO)) {
			result.re.s = -1;
		} else {
			result.re.s = this.re.s;
		}

		result.im.s = this.im.s;

		return result;
	}

	/**
	 * Returns the inverse hyperbolic cosine of this complex number.
	 */
	acosh() {
		// from https://mathworld.wolfram.com/InverseHyperbolicCosine.html
		const num = this.sub(new Complex(ONE)).sqrt();
		const den = new Complex(ONE).sub(this).sqrt();
		return num.div(den).mul(this.acos());
	}

	/**
	 * Returns the inverse hyperbolic tangent of this complex number.
	 */
	atanh() {
		// from https://mathworld.wolfram.com/InverseHyperbolicTangent.html
		return this.mul(I).atan().mul(NEG_I);
	}

	/**
	 * Returns the inverse hyperbolic cosecant of this complex number.
	 */
	acsch() {
		return this.recip().asinh();
	}

	/**
	 * Returns the inverse hyperbolic secant of this complex number.
	 */
	asech() {
		return this.recip().acosh();
	}

	/**
	 * Returns the inverse hyperbolic cotangent of this complex number.
	 */
	acoth() {
		return this.recip().atanh();
	}

	/**
	 * Returns an object with the real and imaginary parts of this complex number in JavaScript's native number type.
	 */
	toNumber() {
		return {re: this.re.toNumber(), im: this.im.toNumber()};
	}

	/**
	 * Returns an object with the real and imaginary parts of this complex number as strings.
	 */
	toJSON() {
		return {re: this.re.toString(), im: this.im.toString()};
	}

	toString() {
		if (this.im.equals(ZERO)) {
			return this.re.toString();
		} else if (this.re.equals(ZERO)) {
			return this.im + 'i';
		}

		let str = this.re.toString();

		if (this.im.lessThan(ZERO)) {
			str += ' - ' + this.im.abs();
		} else {
			str += ' + ' + this.im;
		}

		return str + 'i';
	}
}

const I = new Complex(ZERO, ONE);
const NEG_I = new Complex(ZERO, NEG_ONE);
