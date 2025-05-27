const { debug } = require("../terminal/debug");
const { error } = require("../terminal/error");

const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const get = require("simple-get");

const API_URL = process.env.API_URL;

// Main Event
function sendPostRequest({ data, guildId, type }) {
	try {
		debug({ text: `HTTP Request sent` });

		// Load request options through event parameters
		const opts = {
			url: `${API_URL}/${type}/${guildId}/`,
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
			},
		};

		// HTTP Request
		get.post(opts, (_err, res) => {
			try {
				res.pipe(process.stdout);

				// Wait for API Response
				res.on("data", () => {
					debug({ text: `Response received and HTTP communication ended` });
				});
			} catch (err) {
				if (
					String(err.message).includes(
						`Cannot read properties of undefined (reading 'pipe')`,
					)
				) {
					error({
						text:
							`Looks like the bot can't communicate with ` +
							opts.url.blue +
							`\n  Check that you provided the correct URL and that the API is online and accessible.`,
					});
				} else {
					error({
						text: `Something went wrong while trying to communicate with the API: \n${err}`,
					});
				}
			}
		});
	} catch (err) {
		error({
			text: `Something went wrong while trying to communicate with the API: \n${err}`,
		});
	}
}

module.exports = { sendPostRequest };
