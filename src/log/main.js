'use strict';

const { addErrorHandler, normalizeError, rethrowError } = require('../error');

const { getLogVars } = require('./vars');
const { LEVELS } = require('./constants');
const { logAdapters } = require('./merger');

// Log some event, including printing to console
const logEvent = async function ({
  schema,
  schema: { log: logConf },
  ...rest
}) {
  const { log, schemaFuncInput } = getLogVars({ schema, ...rest });

  // Can fire several logAdapters at the same time
  const promises = logConf
    .map(logConfA => fireLogger({ logConf: logConfA, log, schemaFuncInput }));
  // We make sure this function returns `undefined`
  await Promise.all(promises);
};

const fireLogger = function ({
  logConf: { provider, opts = {}, level },
  log,
  log: { event },
  schemaFuncInput,
}) {
  const noLog = !shouldLog({ level, log });
  if (noLog) { return; }

  const reportFunc = getReportFunc({ event, provider });
  if (reportFunc === undefined) { return; }

  return reportFunc({ log, opts, schemaFuncInput });
};

// Can filter verbosity with `schema.log.level`
// This won't work for very early startup errors since `schema` is not
// parsed yet.
const shouldLog = function ({ level, log }) {
  return level !== 'silent' &&
    LEVELS.indexOf(log.level) >= LEVELS.indexOf(level);
};

const getReportFunc = function ({ event, provider }) {
  // `perf` events are handled differently
  const funcName = event === 'perf' ? 'reportPerf' : 'report';
  const reportFunc = logAdapters[provider][funcName];
  return reportFunc;
};

const logEventHandler = function (error, { schema, event }) {
  const errorA = normalizeError({ error, reason: 'LOG_ERROR' });
  const vars = { error: errorA };
  // Give up if error handler fails
  // I.e. we do not need to `await` this
  silentLogEvent({ event: 'failure', phase: 'process', schema, vars });

  // Failure events are at the top of code stacks. They should not throw.
  if (event === 'failure') { return; }

  rethrowError(error);
};

const eLogEvent = addErrorHandler(logEvent, logEventHandler);

const silentLogEvent = addErrorHandler(logEvent);

module.exports = {
  logEvent: eLogEvent,
};
