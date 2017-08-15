'use strict';

const { isJsl, isEscapedJsl } = require('../test');
const { getRawJsl } = require('../tokenize');
const { memoizeUnlessClient } = require('../memoize');

// Transform JSL into a function with the JSL as body
// Returns as it is not JSL
// This can throw if JSL's JavaScript is wrong
const compileJsl = memoizeUnlessClient(({ jsl, paramsKeys }) => {
  // If this is not JSL, abort
  if (!isJsl({ jsl })) {
    return getNonJsl({ jsl });
  }

  // Removes outer parenthesis
  const rawJsl = getRawJsl({ jsl });

  // Create a function with the JSL as body
  // eslint-disable-next-line no-new-func
  const func = new Function(`{ ${paramsKeys} }`, `return ${rawJsl};`);

  return func;
});

const getNonJsl = function ({ jsl }) {
  // Can escape (...) from being interpreted as JSL by escaping
  // first parenthesis
  if (isEscapedJsl({ jsl })) {
    return jsl.replace('\\', '');
  }

  return jsl;
};

module.exports = {
  compileJsl,
};
