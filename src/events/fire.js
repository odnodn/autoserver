'use strict';

const { addErrorHandler, normalizeError } = require('../error');
const { pSetTimeout, makeImmutable } = require('../utilities');

// Try emit events with an increasing delay
const fireEvent = async function ({ type, eventPayload, runOpts }) {
  await fireSingleEvent({ runOpts, type, eventPayload });

  // Catch-all event type
  await fireSingleEvent({ runOpts, type: 'any', eventPayload });
};

const fireSingleEvent = async function ({
  runOpts: { events = {} },
  type,
  eventPayload,
}) {
  const eventHandler = events[type];
  if (!eventHandler) { return; }

  const eventPayloadA = makeImmutable(eventPayload);
  await eventHandler(eventPayloadA);

  return eventPayloadA;
};

const handleEventError = async function (error, {
  type,
  eventPayload,
  runOpts,
  delay = defaultDelay,
  emitEvent,
}) {
  // Tries again and again, with an increasing delay
  if (delay > maxDelay) { return; }
  await pSetTimeout(delay);
  const delayA = delay * delayExponent;

  // First, report that event handler failed
  await fireEventError({ error, runOpts, delay: delayA, emitEvent });

  // Then, try to report original error again
  await eFireEvent({
    type,
    eventPayload,
    runOpts,
    delay: delayA,
    emitEvent,
  });
};

const eFireEvent = addErrorHandler(fireEvent, handleEventError);

const defaultDelay = 1000;
const delayExponent = 5;
const maxDelay = 1000 * 60 * 3;

const fireEventError = async function ({
  error,
  runOpts,
  delay,
  emitEvent,
}) {
  // Do not report event error created by another event error
  // I.e. only report the first one, but tries to report it again and again
  if (delay > defaultDelay * delayExponent) { return; }

  const errorA = normalizeError({ error, reason: 'EVENT_ERROR' });
  await emitEvent({
    type: 'failure',
    phase: 'process',
    runOpts,
    errorInfo: errorA,
    delay,
  });
};

module.exports = {
  fireEvent: eFireEvent,
};
