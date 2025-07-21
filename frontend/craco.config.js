const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Disable terser for now to avoid validation issues
      if (env === 'production') {
        webpackConfig.optimization.minimize = false;
      }

      // Node.js polyfills
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        zlib: false,
        http: false,
        fs: false,
        path: false,
        net: false,
        tls: false
      };

      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process',
          Buffer: ['buffer', 'Buffer']
        })
      ];

      return webpackConfig;
    }
  }
};