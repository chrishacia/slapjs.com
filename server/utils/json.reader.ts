import fs from 'fs';
import path from 'path';

import { logger } from '../logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jsonReader = (jsonFile: string): Promise<any> => {
    // Read the JSON file asynchronously
    const jsonFilePath = path.join(__dirname, jsonFile);

    return new Promise((resolve, reject) => {
        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
                logger.error(`Error reading file from disk: ${err}`);
                reject(err);
                return;
            }
            try {
                // Parse the JSON data
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (parseErr) {
                logger.error(`Error parsing JSON data: ${parseErr}`);
                reject(parseErr);
            }
        });
    });
};

export const jsonWriter = (jsonFile: string, data: object): Promise<void> => {
    // Write the JSON data to the file asynchronously
    const jsonFilePath = path.join(__dirname, jsonFile);

    return new Promise((resolve, reject) => {
        fs.writeFile(jsonFilePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                logger.error('Error writing to the file:', err);
                reject(err);
                return;
            }
            logger.info(`Data written to ${jsonFile} successfully.`);
            resolve();
        });
    });
};

export const debugJsonFilePath = (jsonFile: string): void => {
    const jsonFilePath = path.join(__dirname, jsonFile);
    logger.info(`JSON file path: ${jsonFilePath}`);
};
