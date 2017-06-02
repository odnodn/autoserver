'use strict';


const http = require('http');

const { getPromise } = require('../../utilities');
const { host, port } = require('../../config');
const { addStopMethods } = require('./stop');


// Start HTTP server
const startServer = function ({ handleRequest, handleListening, processLog }) {
  const server = http.createServer(function requestHandler(req, res) {
    handleRequest({ req, res });
  });

  addStopMethods(server);
  server.protocolName = 'HTTP';

  server.listen(port, host, function listeningHandler() {
    handleListening({ protocol: 'HTTP', host, port });
  });

  const promise = getPromise();
  server.on('listening', () => promise.resolve(server));

  return promise;
};


module.exports = {
  httpStartServer: startServer,
};
