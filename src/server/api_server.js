'use strict';

const EventEmitter2 = require('eventemitter2');

const { getServerInfo } = require('../info');

// Object returned by main function `startServer()`
// Contains general information (options, server name, version, etc.)
// Emits events related to server lifecycle and logging.
const createApiServer = function ({ oServerOpts }) {
  const apiServer = new EventEmitter2({ wildcard: true });

  const {
    serverId,
    serverName,
    apiEngine: { version },
  } = getServerInfo({ serverOpts: oServerOpts });
  const info = { id: serverId, name: serverName, version };

  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(apiServer, { info });

  return apiServer;
};

module.exports = {
  createApiServer,
};
