module.exports = function (api) {
  api.cache(true);
  const presets = [
    ['@babel/typescript'],
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3,
      targets: {
        browsers: ['last 2 Chrome versions']
      }
    }]
  ];

  const plugins = [
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread"
  ];

  console.log('Babel loaded.');
  return {
    babelrcRoots: [
      '.',
      './src/*',
    ],
    ignore: [
      './node_modules/*',
    ],
    presets,
    plugins,
    retainLines: true
  };
};