'use strict'

const { decapitalize } = require('underscore.string')

const { createError, throwError } = require('./main')
const REASONS = require('./reasons')

// Get generic standard error properties, according to error reason
const getProps = function (error) {
  const reason = getReason(error)
  const props = REASONS[reason]
  return props
}

// Get error reason
const getReason = function ({ reason = 'UNKNOWN' } = { reason: 'SUCCESS' }) {
  if (REASONS[reason] === undefined) { return 'UNKNOWN' }

  return reason
}

const createPb = function (message, { messageInput, ...opts } = {}) {
  const messageA = getPropsMessage({ message, messageInput, ...opts })

  const error = createError(messageA, opts)
  return error
}

// Throw exception for a specific error reason
const throwPb = function ({ message, messageInput, ...opts }) {
  const messageA = getPropsMessage({ message, messageInput, ...opts })
  throwError(messageA, opts)
}

const getPropsMessage = function ({ message, messageInput, ...opts }) {
  const prefix = getPrefix({ messageInput, ...opts })
  const messageA = addPrefix({ message, prefix })
  return messageA
}

// Each error reason can have its own message prefix and additional props
const getPrefix = function ({ messageInput, reason, extra = {} }) {
  const { getMessage } = getProps({ reason })
  if (getMessage === undefined) { return }

  const message = getMessage({ ...extra, ...messageInput })
  return message
}

const addPrefix = function ({ message, prefix }) {
  if (message === undefined) { return prefix }
  if (prefix === undefined) { return message }

  return `${prefix}: ${decapitalize(message)}`
}

module.exports = {
  getProps,
  createPb,
  getReason,
  throwPb,
}
