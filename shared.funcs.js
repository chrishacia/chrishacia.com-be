const bcrypt = require('bcryptjs');
const winston = require('winston');
const dotenv = require('dotenv');

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console(),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

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

const getMySqlFormatedDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const getUtcDateTime = () => getMySqlFormatedDate(new Date());

const convertLocalTimeToUtc = (localTimeString, timezoneOffset) => {
  // Create a date object from the local time string
  const localTime = new Date(localTimeString);

  // Convert timezone offset from hours to milliseconds
  // The offset format should be in hours, e.g., -5 for EST or +1 for CET
  const offsetMs = timezoneOffset * 60 * 60 * 1000;

  // Convert local time to UTC by subtracting the timezone offset
  const utcTime = new Date(localTime.getTime() - offsetMs);

  return getMySqlFormatedDate(utcTime);
};


const restful = (req, res, handlers) => {
  const method = (req.method || '').toLowerCase();
  if (!(method in handlers)) {
    res.set('Allow', Object.keys(handlers).join(', ').toUpperCase());
    res.sendStatus(405);
  } else {
    handlers[method](req, res);
  }
};

module.exports = restful;


module.exports = {
  convertLocalTimeToUtc,
  hashPassword,
  getUtcDateTime,
  logger,
  restful,
  verifyPassword
};
