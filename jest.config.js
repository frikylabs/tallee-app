// Jest is pinned to 29 in package.json: jest-expo depends on that ecosystem
// (jest-snapshot@^29, jest-environment-jsdom@^29), and installing the current major leaves a
// flat tree mixing jest-runtime@30 with jest-snapshot@29 — which fails as
// "this._moduleMocker.clearMocksOnScope is not a function", naming nothing version-related.
module.exports = {
  preset: 'jest-expo',
  clearMocks: true,
};
