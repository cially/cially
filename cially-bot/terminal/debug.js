const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const debugging_status = process.env.DEBUGGING;

// Simple Script to display prettier terminal messages
function debug({ text }) {
	if (debugging_status === "TRUE") {
		console.log(`${`\n[DEBUG] `.yellow}${text}`);
	}
}

module.exports = { debug };
