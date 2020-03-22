// Add command information to `def`
export const addCommand = function (def, { parentDef }) {
  const command = def.command || parentDef.command
  return { ...def, command }
}
