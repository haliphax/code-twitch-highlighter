const vscode = require('vscode');
const { Client } = require('tmi.js');

const config = vscode.workspace.getConfiguration('twitchHighlighter');
const twitch = new Client({ channels: [config.channel] });
const decoration = vscode.window.createTextEditorDecorationType({
	backgroundColor: config.backgroundColor,
	color: config.color,
	fontWeight: config.fontWeight,
	border: config.border,
	isWholeLine: true,
});

let removeHighlightTimeout = false;

const highlight = (fromLine, toLine) => {
	const range = new vscode.Range(
		new vscode.Position(fromLine, 0),
		new vscode.Position(toLine, 0));
	const editor = vscode.window.activeTextEditor;

	clearTimeout(removeHighlightTimeout);
	editor.setDecorations(decoration, [range]);
	removeHighlightTimeout = setTimeout(
		() => editor.setDecorations(decoration, []),
		10000);
};

const activate = context => {
	twitch.connect();
	vscode.window.showInformationMessage('Twitch Highlighter connected');
};

const deactivate = () => twitch.disconnect();

twitch.on('message', (channel, tags, message, self) => {
	if (tags['custom-reward-id']) {
		const rewardId = tags['custom-reward-id'];

		if (message.trim() === '!highlight test') {
			vscode.window.showInformationMessage(rewardId);
			return;
		}

		if (rewardId != config.rewardId) return;
	}
	else {
		return;
	}

	try {
		const matches = /^(\d+)([-,: ]\d+)?(.*)$/.exec(message.trim());
		const fromLine = parseInt(matches[1]);
		const toLine = (matches[2] && parseInt(matches[2].substring(1)))
			|| fromLine;

		if (fromLine <= 0 || toLine < fromLine) return;

		let text = matches[3].trim();

		if (text.length === 0) text = 'No message';

		vscode.window.showInformationMessage(
			`${tags['display-name']} is highlighting lines ${fromLine}-${toLine}: ${text}`)
		highlight(fromLine - 1, toLine - 1);
	}
	catch (err) {
		vscode.window.showErrorMessage(err);
	}
});

module.exports = {
	activate,
	deactivate,
};
