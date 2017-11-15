'use strict';

const { decode } = require('iconv-lite');

const { promiseThen } = require('../../../utilities');
const { addGenErrorHandler } = require('../../../error');
const { getLimits } = require('../../../limits');
const { defaultFormat, defaultCharset, parse } = require('../../../formats');

const { getRawPayload } = require('./raw');

// Fill in `mInput.payload` using protocol-specific request payload.
// Are set in a protocol-agnostic format, i.e. each protocol sets the same
// object.
// Meant to be used by rpc layer, e.g. to populate `mInput.args`
const parsePayload = function ({
  specific,
  protocolHandler,
  runOpts,
  charset = defaultCharset,
  format = defaultFormat,
}) {
  if (!protocolHandler.hasPayload({ specific })) { return; }

  const { maxpayload } = getLimits({ runOpts });
  const promise = getRawPayload({ protocolHandler, specific, maxpayload });

  return promiseThen(promise, parseRawPayload.bind(null, { format, charset }));
};

const parseRawPayload = function ({ format, charset }, payload) {
  const payloadA = eDecode(payload, charset);

  const payloadB = eParseContent({ payload: payloadA, format });

  return { payload: payloadB };
};

// Charset decoding is done in a protocol-agnostic way
const eDecode = addGenErrorHandler(decode, {
  message: ({ charset }) => `Invalid request charset: '${charset}' could not be decoded`,
  reason: 'REQUEST_FORMAT',
});

// Parse content, e.g. JSON/YAML parsing
const parseContent = function ({ format, payload }) {
  if (format.parse === undefined) { return payload; }

  return parse({ format: format.name, content: payload });
};

const eParseContent = addGenErrorHandler(parseContent, {
  message: ({ format: { title } }) => `The request payload is invalid ${title}`,
  reason: 'PAYLOAD_PARSE',
});

module.exports = {
  parsePayload,
};