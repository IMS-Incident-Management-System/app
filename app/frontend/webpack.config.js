const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const devServerPort = 8026;
const entryPath = "./src";
const outputPath = path.resolve(__dirname, "dist");
const Dotenv = require("dotenv-webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: `${entryPath}/index.tsx`,
  output: {
    filename: "[name].[contenthash].js",
    path: outputPath,
    publicPath: "/",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        use: ["babel-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              esModule: false, // <-- Это нужно
            },
          },
          ,
          "sass-loader",
        ],
      },
      {
        test: /\.(gif|png|jpe?g)$/,
        type: "asset/resource",
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "@svgr/webpack",
            options: {
              babel: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".css", ".scss"],
    alias: {
      styles: path.resolve(__dirname, "src/styles"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${entryPath}/index.html`,
    }),
    new CopyWebpackPlugin({ patterns: [{ from: "src/public", to: "public" }] }),
    new Dotenv(),
  ],
  optimization: {
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  devServer: {
    static: {
      directory: outputPath,
    },
    compress: true,
    port: devServerPort,
    historyApiFallback: true,
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (error.message === "ResizeObserver loop limit exceeded") {
            return false;
          }
          return true;
        },
      },
    },
  },
};
