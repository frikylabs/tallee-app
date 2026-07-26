// ESLint is pinned to 9 in package.json: eslint-plugin-react, pulled in transitively by
// eslint-config-expo, crashes on ESLint 10's rule-context API
// ("contextOrFilename.getFilename is not a function"). Revisit when that plugin catches up.
const expo = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...expo,
  prettier,
  {
    ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*'],
  },
];
