import bcrypt from 'bcryptjs';
import zxcvbn, {ZXCVBNResult} from 'zxcvbn';

import { logger } from '../logger';

const hashPassword = async (plainTextPassword: string): Promise<[string, string]> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);

    return [salt, hashedPassword];
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw error;
  }
};

const verifyPassword = async (plainTextPassword: string, salt: string, hashedPassword: string): Promise<boolean> => {
  try {
    const hashedPasswordToCompare = await bcrypt.hash(plainTextPassword, salt);
    return hashedPassword === hashedPasswordToCompare;
  } catch (error) {
    logger.error('Error verifying password:', error);
    throw error;
  }
};

const checkStrengthScore = (password: string): ZXCVBNResult => {
  return zxcvbn(password);
};

const checkStrengthValue = (password: string): string => {
  const { score } = checkStrengthScore(password);
  const scoreVerb = ['Risky', 'Weak', 'Medium', 'Tough', 'Strongest'];
  return `PASSWORD_${scoreVerb[score].toUpperCase()}`;
};

/**
 * Password Requirements:
 * At least one uppercase letter.
 * At least one lowercase letter.
 * At least one special character that is safe for the web.
 * A minimum length of 12 characters.
 * No character should repeat more than three times consecutively.
 */
const validatePasswordRequirements = (password: string): boolean => {
  // eslint-disable-next-line no-useless-escape
  return !/^(?!.*(.)\1{3})(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*()_+{}\[\]:;"'<>,.?\/~`|-]).{12,}$/.test(password);
};

export {
  checkStrengthScore,
  checkStrengthValue,
  hashPassword,
  validatePasswordRequirements,
  verifyPassword,
};
