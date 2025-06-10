const winston = require("winston");

const logger = winston.createLogger({
	transports: [new winston.transports.Console()],
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.colorize(),
		winston.format.printf(({ level, message, timestamp }) => {
			return `${timestamp} [${level}]: ${message}`;
		}),
	),
});

module.exports = logger;
