# big-complex.js

`big-complex.js` is an arbitrary-precision Complex number type, backed by [`decimal.js`](https://github.com/MikeMcl/decimal.js). It was created for use in [CalcBot](https://discord.com/application-directory/674457690646249472), a Discord calculator chatbot.

# Install

```bash
npm install big-complex.js
```

```js
const Complex = require('big-complex.js');

// or

import Complex from 'big-complex.js';
```

# Examples

Basic arithmetic:

```js
const a = new Complex(4, 7);
const b = new Complex(-1, 5);

console.log(a.add(b)); // Complex { re: 3, im: 12 }
console.log(b.div(a)); // Complex { re: 0.47692307692307692308, im: 0.41538461538461538462 }
console.log(a.recip()); // Complex { re: 0.061538461538461538462, im: -0.10769230769230769231 }
```

Exponential and logarithm functions:

```js
const e = new Complex('2.7182818284590452353602874713527');
const iPi = new Complex(0, '3.1415926535897932384626433832795');

console.log(e.pow(iPi)); // Complex { re: -1, im: -3.7356616720497115803e-20 }

const negOne = new Complex(-1, 0);

console.log(negOne.ln()); // Complex { re: 0, im: 3.1415926535897932385 }
```

Trigonometric functions:

```js
const r = new Complex(2);
console.log(r.asin()); // Complex { re: 1.5707963267948966192, im: -1.3169578969248167086 }
console.log(r.asech()); // Complex { re: 0, im: 1.0471975511965977461 }
```
