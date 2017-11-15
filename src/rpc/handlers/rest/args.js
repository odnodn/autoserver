'use strict';

const { mapValues } = require('../../../utilities');
const { throwError } = require('../../../error');

// Use query variables, request payload and URL /ID to retrieve `args`
const getArgs = function ({ method, payload, queryvars, id }) {
  // Omitting a query variable's value defaults to `true`
  const args = mapValues(
    queryvars,
    value => (value === '' ? true : value),
  );

  const argsA = addData({ args, payload });
  const argsB = addId({ method, args: argsA, id });
  const argsC = addSilent({ method, args: argsB });
  return argsC;
};

// Use request payload for `args.data`
const addData = function ({ args, payload }) {
  if (payload === undefined) { return args; }

  validatePayload({ payload });

  return { ...args, data: payload };
};

const validatePayload = function ({ payload }) {
  if (payload && typeof payload === 'object') { return; }

  const message = 'Invalid request format: payload must be an object or an array';
  throwError(message, { reason: 'REQUEST_FORMAT' });
};

// Use ID in URL /rest/COLLECTION/ID for `args.id`
const addId = function ({ method, args, args: { data }, id }) {
  if (id === undefined) { return args; }

  // If it looks like a number, it will have been transtyped by query variables
  // middleware
  const idA = String(id);

  // If the method does not use `args.id`, it is still checked against
  // `args.data`
  if (NO_ID_METHODS.includes(method)) {
    validateId({ data, id: idA });
    return args;
  }

  return { ...args, id: idA };
};

const NO_ID_METHODS = ['POST', 'PUT'];

const validateId = function ({ data, id }) {
  if (Array.isArray(data)) {
    const message = 'Payload must be a single object';
    throwError(message, { reason: 'INPUT_VALIDATION' });
  }

  if (data.id !== id) {
    const message = `The model's 'id' is '${data.id}' in the request payload but is '${id}' in the URL`;
    throwError(message, { reason: 'INPUT_VALIDATION' });
  }
};

// Using the `HEAD` method sets `args.silent` `true`
const addSilent = function ({ method, args }) {
  if (method !== 'HEAD') { return args; }

  return { ...args, silent: true };
};

module.exports = {
  getArgs,
};