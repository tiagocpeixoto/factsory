import type { Config } from "@jest/types";
const { jsWithTs: tsjPreset } = require("ts-jest/presets");

const config: Config.InitialOptions = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/__tests__/*",
    "!src/**/__mocks__/*",
  ],
  // coverageDirectory: "<rootDir>/coverage/",
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
  },

  // Activates notifications for test results
  notify: true,

  // A list of paths to directories that Jest should use to search for files in
  roots: ["src"],

  // Allows you to use a custom runner instead of Jest's default test runner
  // runner: "jest-runner",
  runner: "groups",

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  // setupFilesAfterEnv: [],
  setupFilesAfterEnv: ["jest-allure/dist/setup"],

  // The test environment that will be used for testing
  testEnvironment: "node",

  // The glob patterns Jest uses to detect test files
  testMatch: [
    // see tsconfig
    // "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|int-spec|test|unit|it|e2e).[tj]s?(x)",
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    ...tsjPreset.transform,
  },

  // preset: "ts-jest",

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};

export default config;
