module.exports = {
  env: {
    browser: false,
    es6: true,
    mocha: true,
    node: true
  },
  plugins: ["node"],
  extends: ["standard", "plugin:node/recommended"],
  globals: {
    artifacts: false,
    contract: false,
    assert: false,
    web3: false,
    usePlugin: false,
    extendEnvironment: false,
    hre: false
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2018,
    requireConfigFile: false
  },
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      {
        ignores: ["modules"]
      }
    ],
    "node/no-missing-import": "off",
    "node/no-missing-require": "off",
    "node/no-unpublished-require": "off",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "prefer-const": "error",
    "no-var": "error"
  }
};
