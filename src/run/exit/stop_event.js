import filterObj from 'filter-obj'

import { getWordsList } from '../../utils/string.js'
import { logEvent } from '../../log/main.js'
import { getDefaultDuration } from '../../perf/measure.js'

// Emit successful or failed shutdown event
export const emitStopEvent = async function ({ exit, config, measures }) {
  const failedProtocols = getFailedProtocols({ exit })

  const isSuccess = failedProtocols.length === 0
  const failedProtocolsA = getWordsList(failedProtocols, {
    op: 'and',
    quotes: true,
  })
  const message = isSuccess
    ? 'Server exited successfully'
    : `Server exited with errors while shutting down ${failedProtocolsA}`
  const level = isSuccess ? 'log' : 'error'

  const duration = getDefaultDuration({ measures })

  await logEvent({
    event: 'stop',
    phase: 'shutdown',
    level,
    message,
    params: { exit, duration },
    config,
  })
}

// Retrieves which servers exits have failed, if any
const getFailedProtocols = function ({ exit }) {
  const failedExits = filterObj(exit, hasFailedCode)
  const failedProtocols = Object.keys(failedExits)
  return failedProtocols
}

const hasFailedCode = function (key, code) {
  return !code
}
