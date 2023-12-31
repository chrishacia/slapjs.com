const bcrypt = require('bcryptjs');
const logger = require('../logger');

const hashPassword = async (plainTextPassword) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);

    return [salt, hashedPassword];
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw error;
  }
};

const verifyPassword = async (plainTextPassword, salt, hashedPassword) => {
  try {
    const hashedPasswordToCompare = await bcrypt.hash(plainTextPassword, salt);
    logger.log('hashedPasswordToCompare', hashedPasswordToCompare);
    logger.log('hashedPassword', hashedPassword);
    return hashedPassword === hashedPasswordToCompare;
  } catch (error) {
    logger.error('Error verifying password:', error);
    throw error;
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
};
