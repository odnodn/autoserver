'use strict';


const { mapValues, merge } = require('lodash');
const yaml = require('js-yaml');

const { validate, memoize, fs: { readFileAsync } } = require('../utilities');


// Validate IDL definition against a JSON schema
const validateIdl = async function (idl) {
  const schema = await getSchema();
  const idlCopy = getIdlCopy(idl);
  const data = { elem: idlCopy, extra: { argName: 'config' } };
  validate({ schema, data, type: 'idl' });
};

// Adds some temporary property on IDL, to help validation
const getIdlCopy = function (idl) {
  const idlCopy = merge({}, idl);
  const models = mapValues(idlCopy.models, model => Object.assign({}, model, { isTopLevel: true }));
  const modelNames = Object.keys(idlCopy.models);
  Object.assign(idlCopy, { models, modelNames });
  return idlCopy;
};

// Retrieve IDL schema
const getSchema = memoize(async function () {
  const schemaContent = await readFileAsync('./src/idl/idl_schema.yml');
  const schema = yaml.load(schemaContent, { schema: yaml.CORE_SCHEMA, json: true });
  return schema;
});


module.exports = {
  validateIdl,
};
