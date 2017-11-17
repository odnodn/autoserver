'use strict';

const { throwError } = require('../../error');

// Fill in `mInput.headers` using protocol-specific headers.
// Are set in a protocol-agnostic format, i.e. each protocol sets the same
// object.
const parseHeaders = function ({
  specific,
  protocolHandler: { getHeaders },
  topargs = {},
}) {
  const headers = getHeaders({ specific });
  validateHeaders({ headers });

  const topargsA = getTopargs({ topargs, headers });

  return { headers, topargs: topargsA };
};

const validateHeaders = function ({ headers }) {
  if (headers && headers.constructor === Object) { return; }

  const message = `'headers' must be an object, not '${headers}'`;
  throwError(message, { reason: 'SERVER_INPUT_VALIDATION' });
};

// Client parameters can be specified in protocol headers
const getTopargs = function ({ topargs, headers: { params } }) {
  if (params === undefined) { return topargs; }

  return { ...topargs, params };
};

module.exports = {
  parseHeaders,
};
