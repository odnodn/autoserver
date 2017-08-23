'use strict';

const { mapValues } = require('../utilities');

// Take IDL function, inline or not, and turns into `function (...args)`
// firing the first one, with $1, $2, etc. provided as extra arguments
const getHelpers = function ({ idl: { helpers = {} } }) {
  const varsRef = {};

  const helpersA = mapValues(helpers, ({ value: helper, useVars }) =>
    getHelper({ helper, useVars, varsRef })
  );

  return { varsRef, helpers: helpersA };
};

const getHelper = function ({
  helper,
  helper: { inlineFunc },
  useVars,
  varsRef,
}) {
  // Constants are left as is
  const isConstant = typeof helper !== 'function';
  if (isConstant) { return helper; }

  // Non-inline helpers with `useVars` false only get
  // positional arguments, no variables
  if (!inlineFunc && !useVars) { return helper; }

  const helperA = runHelper.bind(null, { helper, varsRef });

  // Keep static member
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(helperA, { inlineFunc });

  return helperA;
};

// Inline function, or non-inline with `useVars` true
// When consumer fires Helper('a', 'b'), inline function translates 'a' and 'b'
// into $1 and $2 variables, and runIdlFunc() is performed.
const runHelper = function ({ helper, varsRef }, ...args) {
  const [$1, $2, $3, $4, $5, $6, $7, $8, $9] = args;
  const posVars = { $1, $2, $3, $4, $5, $6, $7, $8, $9 };

  return helper({ ...varsRef.vars, ...posVars }, ...args);
};

// Pass IDL function variables to helpers
// I.e. helpers have same variables as their caller
// We use a `varsRef` object reference so that all helpers share the same
// information, and can call each other.
// We directly mutate it as a performance optimization.
const bindHelpers = function ({ varsRef, vars }) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  varsRef.vars = vars;
};

module.exports = {
  getHelpers,
  bindHelpers,
};
