module.exports = {
  "roots": [
    "<rootDir>/packages/client",
    "<rootDir>/packages/server",
    "<rootDir>/packages/communication",
    "<rootDir>/packages/diff-calculator"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.ts?$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
}