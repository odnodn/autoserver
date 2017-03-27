'use strict';


const { merge, values, forEach, findKey } = require('lodash');
const { EngineError } = require('../error');


// Retrieves IDL definitions models, after validation and transformation
const getIdlModels = function (obj) {
  // Deep copy, so we do not modify input
  obj = merge({}, obj);
  const models = validateIdlDefinition(obj).models;
  // Transform from object to array, throwing away the property key
  return values(models);
};

// Validate IDL definition
// Also performs some transformation, e.g. adding default values
// TODO: use JSON schema validation|transformation instead
// TODO: move all validation into this method
const validateIdlDefinition = function (obj) {
  validateModelsDefinition(obj.models, { isTopLevel: true });
  return obj;
};

const validateModelsDefinition = function (obj, { isTopLevel }) {
  if (typeof obj !== 'object') { return obj; }

  forEach(obj, (child, attrName) => {
    // `model` must be the only attribute (unless top-level), as it will reference another schema,
    // except for also description and related attributes
    if (child.model && !isTopLevel) {
      const allowedKeys = ['model', 'description', 'deprecation_reason'];
      const wrongKey = findKey(child, (_, key) => !allowedKeys.includes(key));
      if (wrongKey) {
        throw new EngineError(`The following definition cannot have the key '${wrongKey}': ${JSON.stringify(child)}`, {
          reason: 'IDL_WRONG_DEFINITION',
        });
      }
    }

    if (typeof child === 'object') {
      // TODO: should detect whether child _could_ have `type` instead (i.e. is a JSON schema), as we want `type` to be optional
      // Adds def.title default value, by using parent property name
      if (child.type && !child.title) {
        child.title = attrName;
      }
      // Definitions of type `object` must have valid `properties`
      if (child.type === 'object' && !child.model) {
        if (!child.properties || typeof child.properties !== 'object' || Object.keys(child.properties).length === 0) {
          throw new EngineError(`The following definition of type 'object' is missing 'properties': ${JSON.stringify(child)}`, {
            reason: 'IDL_WRONG_DEFINITION',
          });
        }
      }
    }

		if (attrName === 'required' && child instanceof Array) {
			obj.required.forEach(requiredName => {
				const prop = obj.properties[requiredName];
				if (!prop) {
					throw new EngineError(`"${requiredName}" is specified as "required", but is not defined ${JSON.stringify(obj)}`, {
						reason: 'IDL_WRONG_DEFINITION',
					});
				}
				obj.properties[requiredName].required = true;
			});
			delete obj.required;
		}

    // Recurse over children
    validateModelsDefinition(child, { isTopLevel: false });
  }, {});

  return obj;
};


module.exports = {
  getIdlModels,
};