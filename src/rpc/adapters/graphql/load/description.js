import { capitalize } from 'underscore.string'

import { COMMANDS } from '../../../../commands/constants.js'

export const TOP_DESCRIPTIONS = {
  query: 'Fetch models',
  mutation: 'Modify models',
}

// Top-level action descriptions
export const getCommandDescription = function ({ command, typeName }) {
  const title = getTitle({ command })
  const description = `${title} ${typeName} models`
  const descriptionA = capitalize(description)
  return descriptionA
}

// Retrieve the description of a `args.data|filter` type, and of
// `args.data|filter|id` arguments
export const getArgTypeDescription = function ({ command }, type) {
  const title = getTitle({ command })
  const description = `${ARG_TYPES_DESCRIPTIONS[type]} models to ${title}`
  return description
}

const getTitle = function ({ command }) {
  const { title } = COMMANDS.find(
    ({ type, multiple }) => type === command && multiple,
  )
  return title
}

const ARG_TYPES_DESCRIPTIONS = {
  data: "'data' argument with the new",
  filter: "'filter' argument specifying which",
  argId: 'Specifies which',
  argFilter: 'Specifies which',
  argData: 'New',
}
