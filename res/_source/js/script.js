const {
    app,
    BrowserWindow,
    ipcRenderer
} = require('electron')
const path = require('path')
const fs = require('fs');
const $ = require('jquery')

function runBashScript(options) {
    ipcRenderer.send('run-bash-script-req', options)
}

ipcRenderer.on('run-bash-script-res', (event, arg) => {
    console.log(arg)
});

$('#run').on('click', function () {
    runBashScript('options')
});