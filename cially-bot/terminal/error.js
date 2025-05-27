// Simple Script to display prettier terminal messages
function error({ text }) {
	console.log(`${`\n[ERROR] `.red}${text}`);
}

module.exports = { error };
