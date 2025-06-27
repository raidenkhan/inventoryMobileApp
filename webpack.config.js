const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const Dotenv = require('dotenv-webpack');
module.exports = async function (env, argv) {
  
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    vm: false,
   
  };
  config.plugins = [
    ...config.plugins,
    new Dotenv({
      path: './.env.local',
    }),
  ];


  return config;
};
