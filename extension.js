const vscode = require('vscode');
const { Client } = require('tmi.js');

const config = vscode.workspace.getConfiguration('twitchHighlighter');
const api = new Client({ channels: [config.channel] });
const decoration = vscode.window.createTextEditorDecorationType({
	backgroundColor: config.backgroundColor,
	color: config.color,
	fontWeight: config.fontWeight,
	border: config.border,
	isWholeLine: true,
});

let removeHighlightTimeout = false;

const highlight = lineNumber => {
	const range = new vscode.Range(
		new vscode.Position(lineNumber, lineNumber),
		new vscode.Position(lineNumber, lineNumber))
	const editor = vscode.window.activeTextEditor;

	clearTimeout(removeHighlightTimeout);
	editor.setDecorations(decoration, [range]);
	removeHighlightTimeout = setTimeout(() =>
		editor.setDecorations(decoration, []),
		10000);
};

const activate = context => {
	api.connect();
	vscode.window.showInformationMessage('Twitch Highlighter connected');
};

const deactivate = () => api.disconnect();

api.on('message', (channel, tags, message, self) => {
	if (tags['custom-reward-id'] !== config.rewardId)
	{
		console.debug(`Reward ID: ${tags['custom-reward-id']}`);
		console.debug(`Setting value: ${config.rewardId}`);
		return;
	}

	try {
		const matches = /^(\d+)(.*)$/.exec(message.trim());
		const lineNumber = parseInt(matches[1]);
		let text = matches[2].trim();

		if (lineNumber <= 0) return;

		if (text.length === 0) text = 'No message';

		vscode.window.showInformationMessage(
			`${tags['display-name']} is highlighting line ${lineNumber}: ${text}`)
		highlight(lineNumber - 1);
	}
	catch (err) {
		console.error(err);
	}
});

module.exports = {
	activate,
	deactivate,
};
