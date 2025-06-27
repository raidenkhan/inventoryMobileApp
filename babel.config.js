module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // add this if needed:
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            
          },
        },
      ],
    ],
  };
};
