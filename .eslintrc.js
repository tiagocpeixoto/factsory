module.exports = {
  root: true,
  env: {
    browser: false,
    es6: true,
    node: true,
    jest: true,
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "jest"],
  extends: [
    // 'standard',
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "prettier",
  ],
  rules: {
    '@typescript-eslint/no-var-requires': "warn",
    "jest/no-standalone-expect": "warn",
    "jest/no-conditional-expect": "warn",
    "jest/no-export": "warn",
  },
};
