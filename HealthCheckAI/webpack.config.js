const path = require('path');

module.exports = {
  entry: './Pages/History.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.json$/,
        type: 'json',
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [path.resolve(__dirname, 'Components'), 'node_modules'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, './'),
    },
    historyApiFallback: true,
    port: 3000,
    open: true,
  },
  mode: 'development',
};
