'use strict';

const { config, schema } = require('../shared');

// eslint-disable-next-line import/order
const instruction = require('./instruction');

const options = [
  config,

  schema,
  ...require('./limits'),
  ...require('./protocols'),
  ...require('./db'),
];

module.exports = {
  ...instruction,
  options,
};
