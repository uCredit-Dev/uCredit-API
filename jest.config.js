const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  preset: "@shelf/jest-mongodb",
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  testEnvironment: "node",
  transform: tsjPreset.transform,
};
