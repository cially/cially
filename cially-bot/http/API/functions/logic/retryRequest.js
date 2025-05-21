const { debug } = require("../../../../terminal/debug");
const { error } = require("../../../../terminal/error");

async function retryRequest(fn, retries = 25, baseDelay = 1000) {
	let attempt = 0;
	while (attempt < retries) {
		try {
			return await fn();
		} catch (err) {
			if (err.status === 429) {
				const retryAfter = err.response?.headers?.["retry-after"];
				const delay = retryAfter
					? parseInt(retryAfter) * 1000
					: baseDelay * (attempt + 1);
				debug({
					text: `Retrying to communicate with the database in ${delay / 1000}s`,
				});
				await new Promise((resolve) => setTimeout(resolve, delay));
				attempt++;
			} else {
				debug({ text: `API Timeout after ${attempt} retries` });
				throw err;
			}
		}
	}
	throw new Error("Max retries exceeded.");
}

module.exports = { retryRequest };
