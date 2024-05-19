const fs = require('fs');
const path = require('path');
const { logger } = require('../logger');

export const jsonReader = (jsonFile) => {
    // Read the JSON file asynchronously
    const jsonFilePath = path.join(__dirname, jsonFile);

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            logger.error(`Error reading file from disk: ${err}`);
            return;
        }
        // Parse the JSON data
        return JSON.parse(data);
    });
}

export const jsonWriter = (jsonFile, data) => {
    // Write the JSON data to the file asynchronously
    const jsonFilePath = path.join(__dirname, jsonFile);

    fs.writeFile(jsonFilePath, JSON.stringify(data), 'utf8', (err) => {
        if (err) {
            logger.error('Error writing to the file:', err);
            return;
        }
        logger.log(`Data written to ${jsonFile} successfully.`);
    });
};

export const debugJsonFilePath = (jsonFile) => {
    const jsonFilePath = path.join(__dirname, jsonFile);
    logger.log(`JSON file path: ${jsonFilePath}`);
}