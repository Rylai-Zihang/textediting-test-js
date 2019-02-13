module.exports = {
  "roots": [
    "<rootDir>/packages/client/src",
    "<rootDir>/packages/server/src",
    "<rootDir>/packages/communication/src",
    "<rootDir>/packages/diff-calculator/src"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
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