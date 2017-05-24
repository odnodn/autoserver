'use strict';


const { EngineError } = require('../../../error');
const { getRoutes } = require('./routes');


const router = function () {
  const routes = getRoutes();
  return async function router(input) {
    const { path, params, method, jsl } = input;

    const matchedRoute = routes.find({ path, method });
    if (!matchedRoute) {
      const message = 'The requested URL was not found';
      throw new EngineError(message, { reason: 'NOT_FOUND' });
    }

    // Add route and path parameters to input
    const { route, pathParams } = matchedRoute;
    const newParams = Object.assign(params, pathParams);
    const newJsl = jsl.add({ ROUTE: route });

    Object.assign(input, { route, params: newParams, jsl: newJsl });

    const response = await this.next(input);
    return response;
  };
};


module.exports = {
  router,
};
