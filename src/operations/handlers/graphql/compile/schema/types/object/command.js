'use strict';

// Add command information
const addCommand = function (def, { parentDef }) {
  const command = def.command || parentDef.command;
  return { ...def, command };
};

module.exports = {
  addCommand,
};
