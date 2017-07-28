'use strict';

const { pick } = require('../../../utilities');

const { getPaginationInfo } = require('./info');
const { decode, encode } = require('./encoding');

// Add response metadata related to pagination:
//   token, page_size, has_previous_page, has_next_page
// Also removes the extra model fetched to guess has_next_page
const getPaginationOutput = function ({
  args,
  args: { nOrderBy, nFilter, page },
  response,
}) {
  const {
    hasToken,
    token,
    previous,
    next,
    usedPageSize,
    isBackward,
    isOffsetPagination,
  } = getPaginationInfo({ args });

  // If a token (except '') has been used, it means there is a previous page
  // We use ${previous} amd ${next} to reverse directions
  // when doing backward pagination
  const firstHasPreviousPage = isOffsetPagination ? page !== 1 : hasToken;

  // We fetch an extra model to guess has_next_page. If it was founds, remove it
  const lastHasNextPage = response.data.length === usedPageSize;

  const info = {
    [`has_${previous}_page`]: firstHasPreviousPage,
    [`has_${next}_page`]: lastHasNextPage,
  };

  const { data, metadata } = getData({ response, lastHasNextPage, isBackward });

  const pageSize = data.length;

  // Add response.metadata
  const metadataA = data.map((model, index) => {
    // `has_previous_page` and `has_next_page` are only true
    // when on the batch's edges
    const hasPreviousPage = info.has_previous_page || index !== 0;
    const hasNextPage = info.has_next_page || index !== data.length - 1;

    const pages = {
      has_previous_page: hasPreviousPage,
      has_next_page: hasNextPage,
      page_size: pageSize,
    };

    if (isOffsetPagination) {
      pages.page = page;
    } else {
      pages.token = getPaginationToken({ model, nOrderBy, nFilter, token });
    }

    return Object.assign({}, metadata[index], { pages });
  });

  return { data, metadata: metadataA };
};

const getData = function ({
  response: { data, metadata },
  lastHasNextPage,
  isBackward,
}) {
  if (!lastHasNextPage) {
    return { data, metadata };
  }

  if (isBackward) {
    return {
      data: data.slice(1),
      metadata: metadata.slice(1),
    };
  }

  return {
    data: data.slice(0, -1),
    metadata: metadata.slice(0, -1),
  };
};

// Calculate token to output
const getPaginationToken = function ({ model, nOrderBy, nFilter, token }) {
  const tokenObj = getTokenObj({ nOrderBy, nFilter, token });
  tokenObj.parts = tokenObj.nOrderBy.map(({ attrName }) => model[attrName]);
  const encodedToken = encode({ token: tokenObj });
  return encodedToken;
};

const getTokenObj = function ({ nOrderBy, nFilter, token }) {
  if (token === undefined || token === '') {
    return { nOrderBy, nFilter };
  }

  // Reuse old token
  const oldToken = decode({ token });
  return pick(oldToken, ['nOrderBy', 'nFilter']);
};

module.exports = {
  getPaginationOutput,
};
