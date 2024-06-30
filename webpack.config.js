const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Define your source directory and output directory
const sourceDirectory = path.resolve(__dirname, 'client/src/pages');
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

// Webpack configuration
module.exports = {
  mode: process.env.SERVER_ENV || 'development',
  entry,
  output: {
    filename: '[name].bundle.js',
    path: outputDirectory,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Add TypeScript file extensions
    alias: {
      '@components': path.resolve(__dirname, 'client/src/components'), // Optional alias configuration
    },
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
};
