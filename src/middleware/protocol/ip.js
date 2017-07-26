'use strict';

const { throwError } = require('../../error');
const { addJslToInput } = require('../../jsl');

// Retrieve request's IP, assigned to protocol input, and also to JSL $IP
const getIp = async function (nextFunc, input) {
  const { jsl, log } = input;

  const ip = getRequestIp(input);

  const nextInput = addJslToInput(input, jsl, { $IP: ip });
  log.add({ ip });
  Object.assign(nextInput, { ip });

  const response = await nextFunc(nextInput);
  return response;
};

const getRequestIp = function (input) {
  const { protocolHandler } = input;
  const ip = protocolHandler.getIp(input) || '';

  if (typeof ip !== 'string') {
    const message = `'ip' must be a string, not '${ip}'`;
    throwError(message, { reason: 'SERVER_INPUT_VALIDATION' });
  }

  return ip;
};

module.exports = {
  getIp,
};
