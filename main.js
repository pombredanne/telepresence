'use strict';

const fs = require('fs');
const path = require('path');
const electron = require('electron');
const dateformat = require('dateformat');

const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let config;
let mainWindow;
const configPath = path.join(process.env['HOME'], '.telepresence');

function createWindow() {
    if (config !== undefined && config.hasOwnProperty('conferenceId')) {
        openConferenceRoom();
    } else {
        mainWindow = new BrowserWindow({
            height: 300,
            width: 580,
            resizable: false,
            webPreferences: {
                nodeIntegration: true
            }
        });

        mainWindow.loadURL('file://' + __dirname + '/index.html');

        ipcMain.on('setup-complete', function (event, data) {
            config = data;
            fs.writeFileSync(configPath, JSON.stringify(config));

            closeWindow();
            openConferenceRoom();
        });
    }
}

function openConferenceRoom() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            experimentalFeatures: true,
            webSecurity: true,
            nodeIntegration: false
        },
        kiosk: true
    });

    let fullScreenInterval;

    const CLICK_FULLSCREEN_BUTTON = "document.querySelector('#positionA .fullscreen-icon').click();";

    mainWindow.webContents.on('did-finish-load', function () {
        fullScreenInterval = setInterval(function () {
            mainWindow.webContents.executeJavaScript(CLICK_FULLSCREEN_BUTTON, true);
        }, 1500);
    });

    mainWindow.webContents.on('did-start-loading', function () {
        clearInterval(fullScreenInterval);
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        clearInterval(fullScreenInterval);
        mainWindow = null;
    });

    let roomId = `rl-telepresence-${config.conferenceId}-${dateformat(new Date(), 'yyyy-mm-dd')}`;

    mainWindow.loadURL(`https://room.co/#/${roomId}`);
}

function closeWindow() {
    if (mainWindow !== null) {
        mainWindow.close();
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
    if (fs.existsSync(configPath)) {
        try {
            config = JSON.parse(fs.readFileSync(configPath));
        } catch (Error) {
            config = undefined;
        }
    }

    createWindow();

    electron.powerSaveBlocker.start('prevent-display-sleep');

    electron.powerMonitor.on('resume', function () {
        closeWindow();
        createWindow();
    });
})
;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
