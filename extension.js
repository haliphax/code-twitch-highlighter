const vscode = require('vscode');
const config = vscode.workspace.getConfiguration('codeTwitchHighlighter');
const { Client } = require('tmi.js');

const api = new Client({
	channels: [config.channel],
});

api.on('message', (channel, tags, message, self) => {
	if (tags['custom-reward-id'] !== config.rewardId)
		return;

	try {
		const lineNumber = parseInt(/(\d+)/.exec(message)[1]);

		if (lineNumber <= 0) return;

		vscode.window.showInformationMessage(
			`${tags['display-name']} is highlighting line ${lineNumber}!`)
		highlight(lineNumber - 1);
	}
	catch (err) {
		console.error(err);
	}
});

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

module.exports = {
	activate,
	deactivate,
};
