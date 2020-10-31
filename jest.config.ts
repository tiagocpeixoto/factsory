import config from "./jest.config.base";
const pack = require("./package.json");

module.exports = Object.assign(Object.create(null), config, {
  displayName: pack.name,

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFiles: [
    // "dotenv/config",
    // "./jest.setup.js",
  ],
});
