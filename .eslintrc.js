module.exports = {
  root: true,
  env: {
    es2020: true,
    browser: false,
    node: true,
    // jest: true,
    "jest/globals": true,
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: ["./tsconfig.json"],
  },
  plugins: [
    "@typescript-eslint",
    "jest",
    "jest-formatting",
    "promise",
    "import",
    "etc",
    "node",
    "prettier",
  ],
  extends: [
    // 'standard',
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:jest-formatting/recommended",
    "plugin:promise/recommended",
    "plugin:prettier/recommended",
    "plugin:etc/recommended",
  ],
  rules: {
    "@typescript-eslint/no-var-requires": "warn",
    "jest/no-standalone-expect": "warn",
    "jest/no-conditional-expect": "warn",
    "jest/no-export": "warn",
    "etc/prefer-interface": "error",
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "parent", "sibling", "index"],
        // "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    eqeqeq: "warn",
  },
};
