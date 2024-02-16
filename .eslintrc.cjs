module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "index.js"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/explicit-member-accessibility": 1,
    "@typescript-eslint/member-ordering": 1,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "prefer-const": 1
  },
};
