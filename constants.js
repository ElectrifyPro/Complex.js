import Decimal from 'decimal.js';

export const NAN = new Decimal(NaN);
export const INFINITY = new Decimal(Infinity);
export const ZERO = new Decimal(0);
export const ONE_HALF = new Decimal(0.5);
export const NEG_ONE = new Decimal(-1);
export const ONE = new Decimal(1);
export const TWO = new Decimal(2);
export const THREE = new Decimal(3);
export const FOUR = new Decimal(4);
export const TEN = new Decimal(10);
export const PI_OVER_TWO = new Decimal(Decimal.acos(-1).div(2));
export const E = new Decimal(Decimal.exp(1));
