import omit from 'omit.js'

import { mapValues } from '../utils/functional/map.js'

// Start database connection
// Returns a copy of the database adapter, but with fewer members and some other
// members bound
export const connectDatabase = async function (
  { connect, check, ...rest },
  { options, config },
) {
  const connection = await connect({ options, config })

  // Check for data model inconsistencies, and potentially fix them
  if (check !== undefined) {
    check({ options, config, connection })
  }

  const dbAdapterA = getDbAdapter({ options, connection, config, ...rest })
  return dbAdapterA
}

// Pass database state (e.g. connection) to some database adapter's methods
const getDbAdapter = function ({
  options,
  connection,
  config,
  disconnect,
  query,
  wrapped,
}) {
  const methods = mapValues({ disconnect, query }, (method) =>
    wrapMethod.bind(undefined, { method, options, connection, config }),
  )

  // Do not connect twice
  const dbAdapter = omit(wrapped, ['connect', 'check'])

  const dbAdapterA = { ...methods, ...dbAdapter }
  return dbAdapterA
}

const wrapMethod = function ({ method, ...rest }, input, ...args) {
  return method({ ...rest, ...input }, ...args)
}
