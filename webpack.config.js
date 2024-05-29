const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
// eslint-disable-next-line import/no-extraneous-dependencies
// const HtmlWebpackPlugin = require('html-webpack-plugin');

dotenv.config();

// Define your source directory and output directory
const sourceDirectory = path.resolve(__dirname, 'frontend/src/pages');
const outputDirectory = path.resolve(__dirname, 'public/dist');

// Function to scan the source directory for entry points
function getEntryPoints() {
  const entryPoints = {};
  const files = fs.readdirSync(sourceDirectory);

  files.forEach((file) => {
    const filePath = path.join(sourceDirectory, file);
    if (
        fs.statSync(filePath).isFile()
        && (
            file.endsWith('.js')
            || file.endsWith('.jsx')
            || file.endsWith('.ts')
            || file.endsWith('.tsx')
        )) {
      const fileName = path.basename(file, path.extname(file));
      entryPoints[fileName] = filePath;
    }
  });

  return entryPoints;
}

// Generate entry points dynamically
const entry = getEntryPoints();

// Generate HtmlWebpackPlugin instances based on entry points
// const htmlPlugins = Object.keys(entry).map((entryName) => new HtmlWebpackPlugin({
//   title: entryName,
//   chunks: [entryName],
//   // filename: `${entryName}.html`,
// }));

// Webpack configuration
module.exports = {
  mode: process.env.SERVER_ENV,
  entry,
  output: {
    filename: '[name].bundle.js',
    path: outputDirectory,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  // plugins: [...htmlPlugins],
};
