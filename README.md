# Twitch Highlighter for VS Code

Allows Twitch viewers to redeem channel points in order to highlight a line in
the streamer's text editor

## Setup

After it is installed, you will need to at least provide the channel name
(`twitchHighlighter.channel`) and channel points reward identifier
(`twitchHighlighter.rewardId`) before the extension will work. Once these
values have been set, reload your editor.

## Getting the reward ID

In order to obtain the unique ID for the channel points reward, redeem the
reward with `!highlight test` as the text content. The extension should show
the ID in a pop-up window, assuming that it is connected to your channel.
