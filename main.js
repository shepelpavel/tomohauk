const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron')
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec
const configDir = app.getPath('userData') + '/settings/'
const configFile = configDir + 'settings.json'

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
        fs.mkdirSync(configDir)
    }
    if (!fs.existsSync(configFile)) {
        var _options = {
            projects_path: "/var/www/",
            hosts_path: "/etc/hosts",
            sites_conig_path: "/etc/apache2/sites-available/mysites.conf"
        }
        var _json = JSON.stringify(_options)
        fs.writeFile(configFile, _json, 'utf8', function (err, data) {
            if (err) {
                console.log(err)
            }
        })
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
})
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
    })
})
ipcMain.on('get_php_ver', (event, options) => {
    var _result = []
    fs.readdirSync('/etc/apache2/mods-available/').forEach(function (file) {
        if (
            file.match(/^php/gi) &&
            file.match(/conf$/gi)
        ) {
            _result.push(file.replace('php', '').replace('.conf', ''))
        }
    })
    if (_result.length > 0) {
        event.sender.send('php-available', _result)
    }
})
ipcMain.on('get_cur_php_ver', (event, options) => {
    var _result = ''
    fs.readdirSync('/etc/apache2/mods-enabled/').forEach(function (file) {
        if (
            file.match(/^php/gi) &&
            file.match(/conf$/gi)
        ) {
            _result += file.replace('php', '').replace('.conf', '')
        }
    })
    if (_result.length > 0) {
        event.sender.send('php-current', _result)
    }
})
ipcMain.on('save_file', (event, options) => {
    fs.writeFile(configDir + 'tmp', options.text, 'utf8', function (err, data) {
        if (err) {
            event.sender.send('system-res', 'error save tmp file')
            event.sender.send('system-res', err)
        } else {
            var _exec = 'sudo mv ' + configDir + 'tmp ' + options.file + ' && sudo chown -R root:root ' + options.file + ' && sudo chmod 644 ' + options.file + ' && sudo service apache2 restart'
            dir = exec(_exec, function (err, stdout, stderr) {
                if (err) {
                    event.sender.send('system-res', 'error save file')
                    event.sender.send('system-res', stderr)
                } else {
                    event.sender.send('system-res', stdout)
                    event.sender.send('system-res', 'file saved')
                }
            })
        }
    })
})
ipcMain.on('set_php_ver', (event, options) => {
    if (options.en_ver.length > 0 &&
        options.all_ver.length > 0
    ) {
        var _arr = options.all_ver
        var _exec = ''
        for (var _i = 0; _arr.length > _i; _i++) {
            _exec += ' sudo a2dismod php' + _arr[_i] + ' &&'
        }
        _exec += ' sudo a2enmod php' + options.en_ver + ' && sudo service apache2 restart'
        dir = exec(_exec, function (err, stdout, stderr) {
            event.sender.send('system-res', 'change php version ...')
            if (err) {
                event.sender.send('system-res', 'error change php version')
                event.sender.send('system-res', stderr)
            } else {
                if (stdout) {
                    event.sender.send('system-res', stdout)
                }
                event.sender.send('php-current', options.en_ver)
                event.sender.send('system-res', 'apache restarted ...')
            }
        })
    }
})
ipcMain.on('restart_apache', (event, options) => {
    var _exec = 'sudo service apache2 restart'
    dir = exec(_exec, function (err, stdout, stderr) {
        if (err) {
            event.sender.send('system-res', 'error restart apache')
            event.sender.send('system-res', stderr)
        } else {
            if (stdout) {
                event.sender.send('system-res', stdout)
            }
            event.sender.send('system-res', 'apache restarted')
        }
    })
})
ipcMain.on('show_error_log', (event, options) => {
    fs.readFile('/var/log/apache2/error.log', 'utf8', function (err, data) {
        event.sender.send('system-res', 'opening ...')
        if (err) {
            event.sender.send('system-res', 'error open file /var/log/apache2/error.log')
            event.sender.send('system-res', err)
        } else if (data) {
            event.sender.send('to-editor', data)
        }
    })
})
ipcMain.on('show_access_log', (event, options) => {
    fs.readFile('/var/log/apache2/access.log', 'utf8', function (err, data) {
        event.sender.send('system-res', 'opening ...')
        if (err) {
            event.sender.send('system-res', 'error open file /var/log/apache2/error.log')
            event.sender.send('system-res', err)
        } else if (data) {
            event.sender.send('to-editor', data)
        }
    })
})
ipcMain.on('edit_mysites_conf', (event, options) => {
    event.sender.send('system-res', 'opening ...')
    fs.readFile(configFile, 'utf8', function (err, data) {
        var config = JSON.parse(data)
        if (config) {
            fs.readFile(config.sites_conig_path, 'utf8', function (err, data) {
                if (err) {
                    event.sender.send('system-res', 'error open file ' + config.sites_conig_path)
                    event.sender.send('system-res', err)
                } else if (data) {
                    event.sender.send('to-editor', data)
                }
            })
        } else {
            event.sender.send('system-res', 'error open config')
        }
    })
})
ipcMain.on('edit_hosts', (event, options) => {
    event.sender.send('system-res', 'opening ...')
    fs.readFile(configFile, 'utf8', function (err, data) {
        var config = JSON.parse(data)
        if (config) {
            fs.readFile(config.hosts_path, 'utf8', function (err, data) {
                if (err) {
                    event.sender.send('system-res', 'error open file ' + config.hosts_path)
                    event.sender.send('system-res', err)
                } else if (data) {
                    event.sender.send('to-editor', data)
                }
            })
        } else {
            event.sender.send('system-res', 'error open config')
        }
    })
})

////////////////// ipc //////////////////////