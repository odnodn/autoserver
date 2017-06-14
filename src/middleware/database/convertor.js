'use strict';


// Converts from Command format to Database format
const databaseConvertor = function () {
  return async function databaseConvertor({
    command,
    args,
    modelName,
    jsl,
    log,
    params,
    settings,
  }) {
    const perf = log.perf.start('database.convertor', 'middleware');

    const nextInput = {
      command,
      args,
      modelName,
      jsl,
      log,
      params,
      settings,
    };

    perf.stop();
    const response = await this.next(nextInput);
    return response;
  };
};


module.exports = {
  databaseConvertor,
};
