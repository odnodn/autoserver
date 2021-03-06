// Retrieve `currentData`, so it is passed to command middleware
export const getCurrentData = function ({ actions, ids }) {
  const currentData = actions.flatMap((action) => action.currentData)
  // Keep the same order as `newData` or `args.filter.id`
  const currentDataA = ids.map((id) => findCurrentData({ id, currentData }))
  return currentDataA
}

const findCurrentData = function ({ id, currentData }) {
  return currentData.find(
    (currentDatum) => currentDatum && currentDatum.id === id,
  )
}
