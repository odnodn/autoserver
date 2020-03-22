import filterObj from 'filter-obj'

// Apply GraphQL-specific error response transformation
export const transformSuccess = function ({
  response: {
    content: { metadata, ...content },
  },
}) {
  // According to GraphQL spec, extra metadata should be called `extensions`
  return { ...content, extensions: metadata }
}

// Apply GraphQL-specific error response transformation
export const transformError = function ({
  response: {
    content: { error, metadata },
  },
}) {
  const errors = getError(error)

  // According to GraphQL spec, `data` should be `null` if `errors` is set
  return { data: null, errors, extensions: metadata }
}

// GraphQL spec error format
const getError = function ({ type, title, description, ...extraContent }) {
  // Content following GraphQL spec
  // Custom information not following GraphQL spec is always rendered
  const error = { type, title, message: description, ...extraContent }

  const errorA = filterObj(error, isDefined)
  return [errorA]
}

const isDefined = function (key, value) {
  return value !== undefined
}
