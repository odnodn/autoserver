import { isDeepStrictEqual } from 'util'

export const includes = function (arr, valA) {
  return arr.some((valB) => isDeepStrictEqual(valA, valB))
}
