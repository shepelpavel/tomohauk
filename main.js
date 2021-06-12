const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron')
const path = require('path')
const fs = require('fs');
const exec = require('child_process').exec;
const configDir = app.getPath('userData') + '/settings/';
const configFile = configDir + 'settings.json';

/////////////// function ////////////////////

function createWindow() {
    const win = new BrowserWindow({
        width: 1300,
        height: 600,
        minWidth: 900,
        minHeight: 600,
        autoHideMenuBar: true,
        icon: __dirname + '/res/icons/icon.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'res/render/preload.js')
        }
    })

    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
    }
    if (!fs.existsSync(configFile)) {
        var _options = {
            projects_path: "/var/www/",
            hosts_path: "/fetc/hosts",
            sites_conig_path: "/etc/apache2/sites-available/mysites.conf"
        }
        var _json = JSON.stringify(_options)
        fs.writeFile(configFile, _json, 'utf8', function (err, data) {
            if (err) {
                console.log(err);
            }
        });
    }

    win.loadFile('res/render/index.html')
    // win.setMenu(null)
    win.webContents.openDevTools()
}

/////////////// function ////////////////////


///////////////// app ///////////////////////

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

///////////////// app ///////////////////////


////////////////// ipc //////////////////////

ipcMain.on('get_settings', (event, options) => {
    _result = JSON.parse(fs.readFileSync(configFile))
    event.sender.send('settings-data', _result)
});
ipcMain.on('write_settings', (event, options) => {
    var _json = JSON.stringify(options)
    fs.writeFile(configFile, _json, 'utf8', function (err, data) {
        if (err) {
            event.sender.send('system-res', 'error save settings')
            event.sender.send('system-res', err)
        } else {
            event.sender.send('system-res', 'settings saved')
        }
        if (data) {
            event.sender.send('system-res', data)
        }
    });
});
ipcMain.on('get_php_ver', (event, options) => {
    var _result = []
    fs.readdirSync('/etc/apache2/mods-available/').forEach(function (file) {
        if (
            file.match(/^php/gi) &&
            file.match(/conf$/gi)
        ) {
            _result.push(file.replace('php', '').replace('.conf', ''))
        }
    });
    if (_result.length > 0) {
        event.sender.send('php-available', _result)
    }
});
ipcMain.on('restart_apache', (event, options) => {
    let _exec = 'sudo service apache2 restart'
    dir = exec(_exec, function (err, stdout, stderr) {
        if (err) {
            event.sender.send('system-res', 'error restart apache')
            event.sender.send('system-res', stderr)
        }
        event.sender.send('system-res', 'apache restarted')
        if (stdout) {
            event.sender.send('system-res', stdout)
        }
    });
});
ipcMain.on('open_error_log', (event, options) => {
    let _exec = 'xdg-open /var/log/apache2/error.log'
    dir = exec(_exec, function (err, stdout, stderr) {
        if (err) {
            event.sender.send('system-res', 'error open editor')
            event.sender.send('system-res', stderr)
        }
        event.sender.send('system-res', 'opening ...')
        if (stdout) {
            event.sender.send('system-res', stdout)
        }
    });
});
ipcMain.on('show_error_log', (event, options) => {
    fs.readFile('/var/log/apache2/error.log', 'utf8', function (err, data) {
        if (err) {
            event.sender.send('system-res', 'error open file /var/log/apache2/error.log')
            event.sender.send('system-res', err)
        }
        event.sender.send('system-res', 'opening ...')
        if (data) {
            event.sender.send('to-editor', data)
        }
    });
});
ipcMain.on('open_access_log', (event, options) => {
    let _exec = 'xdg-open /var/log/apache2/access.log'
    dir = exec(_exec, function (err, stdout, stderr) {
        if (err) {
            event.sender.send('system-res', 'error open editor')
            event.sender.send('system-res', stderr)
        }
        event.sender.send('system-res', 'opening ...')
        if (stdout) {
            event.sender.send('system-res', stdout)
        }
    });
});
ipcMain.on('show_access_log', (event, options) => {
    fs.readFile('/var/log/apache2/access.log', 'utf8', function (err, data) {
        if (err) {
            event.sender.send('system-res', 'error open file /var/log/apache2/error.log')
            event.sender.send('system-res', err)
        }
        event.sender.send('system-res', 'opening ...')
        if (data) {
            event.sender.send('to-editor', data)
        }
    });
});
ipcMain.on('edit_mysites_conf', (event, options) => {
    let _exec = 'sudo xdg-open /etc/apache2/sites-available/mysites.conf'
    dir = exec(_exec, function (err, stdout, stderr) {
        if (err) {
            event.sender.send('system-res', 'error open editor')
            event.sender.send('system-res', stderr)
        }
        event.sender.send('system-res', 'opening ...')
        if (stdout) {
            event.sender.send('system-res', stdout)
        }
    });
});
ipcMain.on('edit_hosts', (event, options) => {
    let _exec = 'sudo xdg-open /etc/hosts'
    dir = exec(_exec, function (err, stdout, stderr) {
        if (err) {
            event.sender.send('system-res', 'error open editor')
            event.sender.send('system-res', stderr)
        }
        event.sender.send('system-res', 'opening ...')
        if (stdout) {
            event.sender.send('system-res', stdout)
        }
    });
});
ipcMain.on('show_php_version', (event, options) => {
    let _exec = 'ls -a -1 /etc/apache2/mods-enabled/ | grep -E ^php[A-Za-z0-9]{1}.[A-Za-z0-9]{1}.load'
    dir = exec(_exec, function (err, stdout, stderr) {
        if (err) {
            event.sender.send('system-res', 'error php version')
            event.sender.send('system-res', stderr)
        }
        if (stdout) {
            event.sender.send('system-res', stdout)
        }
    });
});

////////////////// ipc //////////////////////