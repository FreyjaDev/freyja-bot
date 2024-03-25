module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ["@typescript-eslint/eslint-plugin"],
    extends: [
        'plugin:@typescript-eslint/recommended-type-checked',
        'prettier'
    ],
    root: true,
    env: {
        node: true,
    },
    ignorePatterns: [
        '.eslintrc.js',
    ],
}