const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron')
const path = require('path')
const fs = require('fs');
const {
    spawn
} = require('child_process')

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 600,
        autoHideMenuBar: true,
        icon: __dirname + '/res/icons/icon256.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'res/render/preload.js')
        }
    })

    win.loadFile('res/render/index.html')
    win.webContents.openDevTools()
}

function runBashScript(options) {
    console.log(options);
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.on('run-bash-script-req', (event, options) => {
    runBashScript(options)
    event.sender.send('run-bash-script-res', 'run')
});