const webpack = require("webpack")

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
  }
  config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]

  config.devServer = {
    ...config.devServer,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Credentials": "true",
      }
  };

  return config
}