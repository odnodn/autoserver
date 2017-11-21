'use strict';

const { omit } = require('../../../utilities');
const { extractSimpleIds } = require('../../../filter');

// Fire the actual command
const fireReadCommand = async function ({
  action: { commandpath, collname, clientCollname = collname },
  mInput,
  nextLayer,
  args,
}) {
  const emptyCommand = isEmptyCommand({ args });
  if (emptyCommand) { return []; }

  const argsA = omit(args, 'data');

  const mInputA = {
    ...mInput,
    commandpath: commandpath.join('.'),
    collname,
    clientCollname,
    args: argsA,
    command: 'find',
  };

  // Fire `request`, `database` and `response` layers serially
  const mInputB = nextLayer(mInputA, 'request');

  const { response } = await nextLayer(mInputB, 'database');
  const mInputC = { ...mInputB, response };

  const { response: { data, metadata } } = await nextLayer(mInputC, 'response');

  return data.map(model => ({ model, metadata }));
};

// When parent value is not defined, directly returns empty value
const isEmptyCommand = function ({ args }) {
  const ids = extractSimpleIds(args);
  return Array.isArray(ids) && ids.length === 0;
};

module.exports = {
  fireReadCommand,
};
