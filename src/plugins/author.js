import { attributesPlugin } from './attributes.js'

// Plugin that adds who modified last each model:
//   created_by {User} - set on model creation
//   updated_by {User} - set on model creation, modification or deletion
// Are handled by the system, and cannot be overriden by users
// User is specified by opts:
//   [currentuser] {function} - current user
//   [collection] {string} - user's collection name
export const authorPlugin = function ({ config, opts }) {
  return attributesPlugin({
    name: 'author',
    getAttributes,
    optsSchema: OPTS_SCHEMA,
    config,
    opts,
  })
}

const OPTS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    currentuser: {
      typeof: 'function',
    },
    collection: {
      type: 'string',
      enum: {
        $data: '/dynamicVars/collTypes',
      },
    },
  },
}

const getAttributes = ({ currentuser, collection }) => ({
  created_by: {
    description: 'Who created this model',
    type: collection,
    value: getCreatedBy.bind(null, currentuser),
  },
  updated_by: {
    description: 'Who last updated this model',
    type: collection,
    value: getUpdatedBy.bind(null, currentuser),
  },
})

const getCreatedBy = function (currentuser, params) {
  const { previousmodel, previousvalue } = params

  if (previousmodel !== undefined) {
    return previousvalue
  }

  return currentuser(params).id
}

const getUpdatedBy = function (currentuser, params) {
  return currentuser(params).id
}
