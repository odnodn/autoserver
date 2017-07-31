'use strict';

const {
  applyInputTransforms,
  applyOutputTransforms,
} = require('./transformer');

/**
 * Applies schema `transform`
 * Those are mapping functions applies on input for a particular attribute.
 * They can be any static value or JSL.
 * Note: transforms do not have to be idempotent.
 * Transforms format:
 *   - value {any} - same as { value: value }
 *   - options {object}:
 *      - value {(jsl|any)} - value to transform to.
 *        Can use JSL, including $ and $$.
 *      - [test] {(jsl|bool)} - if false, the transform is not applied
 *        Note that without `test`, $ can be undefined in `value`.
 *      - [using] {str|str[]} - list of attribute names that one desires to
 *        use as $$.ATTRIBUTE in either `value` or `test`
 * Also applies `compute`, which is essentially the same, except it is never
 * persisted in the database, while present in response. This implies:
 *  - JSL cannot use $ nor $$.CURRENT_ATTRIBUTE
 *  - `readOnly` true is implied
 *  - cannot be used together with any property that imply the attribute
 *    should be persisted, including `transform`, `default` or input validation
 **/
const handleTransforms = async function (nextFunc, input) {
  const inputA = applyInputTransforms({ input, type: 'transform' });

  const response = await nextFunc(inputA);

  const responseA = applyOutputTransforms({ input, response, type: 'compute' });

  return responseA;
};

module.exports = {
  handleTransforms,
};
