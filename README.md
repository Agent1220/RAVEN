# RAVEN
A tool for creating and visualising RAVON-like charts. Made using the [Neutralino.js](https://neutralino.js.org/) framework.

## Installation guide (RELEASE)
1. Download resources.neu
2. Download the binary according to your system. The naming syntax is raven-\[OS]\_\[ARCHITECTURE]. If you're downloading for Windows, download the WebView2Loader.dll as well.
3. Put all files in the same folder.
4. You can run the program now.

## Web version
The web version is stripped of Neutralino and meant for people that can't use any of the binaries.
Download the contents of `raven web` then open index.html with a browser to use the program.

## Source files
Make sure you've installed the [Neutralino CLI](https://neutralino.js.org/docs/getting-started/your-first-neutralinojs-app#step-0-installing-neu-cli) first. After cloning, you can `neu run` in the terminal while in the root folder (containing `neutralino.config.json`) to run the program. When you save, Neutralino reloads the app so you can see your changes immediately.

Build distributable binaries with `neu build`, but make sure you don't commit them.
