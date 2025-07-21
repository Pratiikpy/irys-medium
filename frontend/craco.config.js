const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Fix terser-webpack-plugin validation issue
      if (env === 'production') {
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.map(plugin => {
          if (plugin.constructor.name === 'TerserPlugin') {
            return new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
            });
          }
          return plugin;
        });
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