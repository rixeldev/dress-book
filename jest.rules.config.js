/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/db/rules/__tests__/**/*.test.js"],
  testTimeout: 30000,
}
