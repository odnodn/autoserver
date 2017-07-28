'use strict';

const { IncomingMessage } = require('http');
const { promisify } = require('util');

const bodyParser = require('body-parser');

const { assignObject } = require('../../../utilities');

// Retrieves all parsers
const getParsers = function () {
  return parsers
    .map(({ type, exportsType = type, opts }) => {
      const parser = promisify(bodyParser[type](opts));
      const boundParseFunc = parseFunc.bind(null, parser);
      return { [exportsType]: boundParseFunc };
    })
    .reduce(assignObject, {});
};

const parsers = [
  {
    type: 'text',
    exportsType: 'graphql',
    opts: { type: 'application/graphql' },
  },
  { type: 'json' },
  {
    type: 'urlencoded',
    opts: { extended: true },
  },
  { type: 'text' },
  { type: 'raw' },
];

// Parses and serializes HTTP request payload
// Handles HTTP compression
// Max limit 100KB
// Recognizes: application/json, application/x-www-form-urlencoded,
// string, binary, application/graphql
const parseFunc = async function (parser, { specific: { req } }) {
  // `body-parser` will fill req.body = {} even if there is no body.
  // We want to know if there is a body or not though,
  // so must keep req.body to undefined if there is none
  const body = req.body || {};
  // Parsers have side-effects, i.e. adding req.body and req._body,
  // and we do not want those side-effects
  const newReq = new IncomingMessage();
  // We have to directly assign newReq to keep its prototype
  // eslint-disable-next-line fp/no-mutating-assign
  const reqCopy = Object.assign(newReq, req, { body });

  await parser(reqCopy, null);

  const { body: newBody } = reqCopy;
  const finalBody = newBody === body ? undefined : newBody;
  return finalBody;
};

const parsePayload = getParsers();

// Check if there is a request payload
const hasPayload = function ({ specific: { req: { headers } } }) {
  return Number(headers['content-length']) > 0 ||
    headers['transfer-encoding'] !== undefined;
};

// Retrieves payload MIME type
const getContentType = function ({ specific: { req: { headers } } }) {
  return headers['content-type'];
};

module.exports = {
  parsePayload,
  hasPayload,
  getContentType,
};
