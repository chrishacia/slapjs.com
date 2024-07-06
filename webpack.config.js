const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

// Define your source directory and output directory
const sourceDirectory = path.resolve(__dirname, "client/src/pages");
const outputDirectory = path.resolve(__dirname, "public/dist");

// Function to recursively scan directories for entry points
function getEntryPoints(directory) {
  const entryPoints = {};

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath); // Recursively scan subdirectories
      } else if (
        stat.isFile() &&
        (file.endsWith(".js") ||
          file.endsWith(".jsx") ||
          file.endsWith(".ts") ||
          file.endsWith(".tsx"))
      ) {
        const fileName = path
          .relative(sourceDirectory, filePath)
          .replace(/\\/g, "/")
          .replace(/\.[^/.]+$/, "");
        entryPoints[fileName] = filePath;
      }
    });
  }

  scanDirectory(directory);

  return entryPoints;
}

// Generate entry points dynamically
const entry = getEntryPoints(sourceDirectory);

// Webpack configuration
module.exports = {
  mode: process.env.SERVER_ENV || "development",
  entry,
  output: {
    filename: "[name].bundle.js",
    path: outputDirectory,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"], // Add TypeScript file extensions
    alias: {
      "@components": path.resolve(__dirname, "client/src/components"), // Optional alias configuration
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
