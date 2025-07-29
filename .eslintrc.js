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
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
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
    "no-var": "error",
    semi: ["error", "always"],
    quotes: ["error", "double"],
    "no-process-exit": "off", // Allow process.exit in deployment scripts
    "no-unused-expressions": "off" // Allow chai expect expressions
  },
  overrides: [
    {
      files: ["scripts/*.js"],
      rules: {
        "no-process-exit": "off"
      }
    },
    {
      files: ["test/*.js"],
      rules: {
        "no-unused-expressions": "off"
      }
    }
  ]
};
