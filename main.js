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

const cssStyles = `
#backdrop {
    background: #1a1a1a !important;
}

#open-sidebar-container,
#identity-menu-container,
#js-left-menu,
.room-footer,
#room-menu {
    display: none !important;
}
`;

const ROOM_CHECKUP = `
    (function() {
        // ensure the sidebar stays hidden
        var sidebar = document.querySelector('#side-bar-room');
        if(sidebar !== null && sidebar.offsetParent !== null) {
            var menuButton = document.querySelector('.menu-icon');
            if(menuButton !== null)
                menuButton.click();
        }
        
        // ensure the video stream is enabled
        var enableVideoButton = document.querySelector('.camera-icon.ng-hide');
        if(enableVideoButton !== null)
            enableVideoButton.click();
    })();
`;

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

    let checkupInterval;
    let insertedCss = false;

    mainWindow.webContents.on('did-finish-load', function () {
        setTimeout(function () {
            if (mainWindow !== null && mainWindow.webContents !== null) {
                mainWindow.webContents.insertCSS(cssStyles);
                insertedCss = true;
            } else {
                setTimeout(this, 500);
            }
        });

        checkupInterval = setInterval(function () {
            if (mainWindow !== null && mainWindow.webContents !== null) {
                mainWindow.webContents.executeJavaScript(ROOM_CHECKUP, true);
            }
        }, 3000);
    });

    mainWindow.webContents.on('did-start-loading', function () {
        clearInterval(checkupInterval);
        insertedCss = false;
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        clearInterval(checkupInterval);
        mainWindow = null;
    });

    let roomId = `rl-telepresence-${config.conferenceId}`;

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
