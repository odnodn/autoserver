import { parse as json5Parse, stringify as json5Stringify } from 'json5'

// Parses a JSON5 file
const parse = function ({ content }) {
  return json5Parse(content)
}

// Serializes a JSON5 file
const serialize = function ({ content }) {
  return json5Stringify(content, undefined, 2)
}

export const json5 = {
  name: 'json5',
  title: 'JSON5',
  extensions: ['json5'],
  mimes: ['application/json5'],
  mimeExtensions: ['+json5'],
  charsets: ['utf-8'],
  jsonCompat: ['superset'],
  parse,
  serialize,
}
