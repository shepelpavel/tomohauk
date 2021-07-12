const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron')
const os = require('os')
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec
const configDir = app.getPath('userData') + '/settings/'
const configFile = configDir + 'settings.json'
const username = os.userInfo().username

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
            sites_conig_path: ""
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

// get settings from file
ipcMain.on('get_settings', (event, options) => {
    _result = JSON.parse(fs.readFileSync(configFile))
    event.sender.send('settings-data', _result)
})

// write settings to file
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
        event.sender.send('loader-hide')
    })
})

// get installed php version
ipcMain.on('get_php_ver', (event, options) => {
    var _result = []
    if (fs.existsSync('/etc/php/')) {
        fs.readdirSync('/etc/php/').forEach(function (file) {
            _result.push(file)
        })
        if (_result.length > 0) {
            event.sender.send('php-available', _result)
        }
    }
})

// get enabled php version
ipcMain.on('get_cur_php_ver', (event, options) => {
    var _result = ''
    if (fs.existsSync('/etc/apache2/mods-available/')) {
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
    }
})

// save file from editor
ipcMain.on('save_file', (event, options) => {
    fs.writeFile(configDir + 'tmp', options.text, 'utf8', function (err, data) {
        if (err) {
            event.sender.send('system-res', 'error save tmp file')
            event.sender.send('system-res', err)
            event.sender.send('loader-hide')
        } else {
            var _exec = 'sudo mv ' + configDir + 'tmp ' + options.file + ' && sudo chown -R root:root ' + options.file + ' && sudo chmod 644 ' + options.file + ' && sudo service nginx restart && sudo service apache2 restart'
            dir = exec(_exec, function (err, stdout, stderr) {
                if (err) {
                    event.sender.send('system-res', 'error save file')
                    event.sender.send('system-res', stderr)
                } else {
                    event.sender.send('system-res', stdout)
                    event.sender.send('system-res', 'file saved')
                }
                event.sender.send('loader-hide')
            })
        }
    })
})

// get nginx enabled sites
ipcMain.on('get_sites_enable', (event, options) => {
    var _site_conf = '/etc/nginx/sites-enabled/'
    var _result = []
    if (fs.existsSync(_site_conf)) {
        fs.readdirSync(_site_conf).forEach(function (file) {
            _result.push(file)
        })
        if (_result.length > 0) {
            event.sender.send('sites-enable-arr', _result)
        }
    }
})

// add domain to local
ipcMain.on('add_domain', (event, options) => {
    var _hosts = '127.0.0.1 ' + options.name
    fs.readFile(configFile, 'utf8', function (err, data) {
        var config = JSON.parse(data)
        if (config) {
            if (options.proxy) {
                // if proxy nginx to apache
                var _config_nginx = `server {
    listen 80;
    listen [::]:80;
    server_name ${options.name};
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_redirect http://127.0.0.1:8080 /;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`
                var _config_apache = `<VirtualHost ${options.name}:8080>
    ServerName ${options.name}
    DocumentRoot /var/www/${options.name}${options.public}
    <IfModule mpm_itk_module>
        AssignUserId ${username} ${username}
    </IfModule>
    <Directory /var/www/${options.name}${options.public}>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
`
                if (!fs.existsSync('/etc/nginx/sites-available/' + options.name)) {
                    fs.writeFile(configDir + 'tmp_domain_nginx', _config_nginx, 'utf8', function (err, data) {
                        if (err) {
                            event.sender.send('system-res', 'error save tmp_domain_nginx file')
                            event.sender.send('system-res', err)
                            event.sender.send('loader-hide')
                        } else {
                            fs.writeFile(configDir + 'tmp_domain_apache', _config_apache, 'utf8', function (err, data) {
                                if (err) {
                                    event.sender.send('system-res', 'error save tmp_domain_apache file')
                                    event.sender.send('system-res', err)
                                    event.sender.send('loader-hide')
                                } else {
                                    var _exec = 'sudo mv ' + configDir + 'tmp_domain_nginx /etc/nginx/sites-available/' + options.name + ' && sudo mv ' + configDir + 'tmp_domain_apache /etc/apache2/sites-available/' + options.name + '.conf && sudo chown -R root:root /etc/nginx/sites-available/' + options.name + ' && sudo chmod 644 /etc/nginx/sites-available/' + options.name + ' && sudo chown -R root:root /etc/apache2/sites-available/' + options.name + '.conf && sudo chmod 644 /etc/apache2/sites-available/' + options.name + '.conf && sudo a2ensite ' + options.name + '.conf && sudo ln -s /etc/nginx/sites-available/' + options.name + ' /etc/nginx/sites-enabled/ && echo "' + _hosts + '" | sudo tee -a ' + config.hosts_path + ' && sudo service apache2 restart && sudo service nginx restart'
                                    dir = exec(_exec, function (err, stdout, stderr) {
                                        if (err) {
                                            event.sender.send('system-res', 'error exec command')
                                            event.sender.send('system-res', stderr)
                                        } else {
                                            event.sender.send('system-res', stdout)
                                            event.sender.send('system-res', 'domain added')
                                            event.sender.send('clear-inputs-domain')
                                        }
                                        event.sender.send('loader-hide')
                                        event.sender.send('rescan-sites')
                                    })
                                }
                            })
                        }
                    })
                } else {
                    event.sender.send('system-res', 'domain exist')
                    event.sender.send('loader-hide')
                    event.sender.send('clear-inputs-domain')
                }
            } else {
                // if no proxy to apache, use only nginx
                var _config_nginx = `server {
    listen 80;
    listen [::]:80;
    root /var/www/${options.name}${options.public};
    index index.html index.php;
    server_name ${options.name};
    location / {
        try_files $uri $uri/ =404;
    }
    location ~ \\.php$ {
        try_files $uri = 404;
        include fastcgi_params;
        fastcgi_pass  unix:/run/php/php${options.php}-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    }
    error_page 405 =200 $uri;
}
`
                if (!fs.existsSync('/etc/nginx/sites-available/' + options.name)) {
                    fs.writeFile(configDir + 'tmp_domain_nginx', _config_nginx, 'utf8', function (err, data) {
                        if (err) {
                            event.sender.send('system-res', 'error save tmp_domain_nginx file')
                            event.sender.send('system-res', err)
                            event.sender.send('loader-hide')
                        } else {
                            var _exec = 'sudo mv ' + configDir + 'tmp_domain_nginx /etc/nginx/sites-available/' + options.name + ' && sudo chown -R root:root /etc/nginx/sites-available/' + options.name + ' && sudo chmod 644 /etc/nginx/sites-available/' + options.name + ' && sudo ln -s /etc/nginx/sites-available/' + options.name + ' /etc/nginx/sites-enabled/ && echo "' + _hosts + '" | sudo tee -a ' + config.hosts_path + ' && sudo service nginx restart'
                            dir = exec(_exec, function (err, stdout, stderr) {
                                if (err) {
                                    event.sender.send('system-res', 'error exec command')
                                    event.sender.send('system-res', stderr)
                                } else {
                                    event.sender.send('system-res', stdout)
                                    event.sender.send('system-res', 'domain added')
                                    event.sender.send('clear-inputs-domain')
                                }
                                event.sender.send('loader-hide')
                                event.sender.send('rescan-sites')
                            })
                        }
                    })
                } else {
                    event.sender.send('system-res', 'domain exist')
                    event.sender.send('loader-hide')
                    event.sender.send('clear-inputs-domain')
                }
            }
        } else {
            event.sender.send('system-res', 'error open config')
            event.sender.send('loader-hide')
        }
    })
})

// open site config for nginx in editor
ipcMain.on('edit_site_config', (event, options) => {
    var _site_conf = '/etc/nginx/sites-available/' + options.file
    if (fs.existsSync(_site_conf)) {
        event.sender.send('system-res', 'opening ...')
        fs.readFile(_site_conf, 'utf8', function (err, data) {
            if (err) {
                event.sender.send('system-res', 'error open config file ' + _site_conf)
                event.sender.send('system-res', err)
            } else if (data) {
                var _to_editor = {
                    file: _site_conf,
                    text: data,
                    be_save: true
                }
                event.sender.send('to-editor', _to_editor)
            }
            event.sender.send('loader-hide')
        })
    } else {
        event.sender.send('system-res', 'config not exist ...')
    }
})

// delete site configs for nginx and apache
ipcMain.on('delete_site_config', (event, site) => {
    fs.readFile(configFile, 'utf8', function (err, data) {
        var config = JSON.parse(data)
        if (config) {
            var _exec = ''
            if (fs.existsSync('/etc/nginx/sites-enabled/' + site)) {
                _exec += 'sudo rm /etc/nginx/sites-enabled/' + site + ' && '
            }
            if (fs.existsSync('/etc/nginx/sites-available/' + site)) {
                _exec += 'sudo rm /etc/nginx/sites-available/' + site + ' && '
            }
            if (fs.existsSync('/etc/apache2/sites-enabled/' + site + '.conf')) {
                _exec += 'sudo rm /etc/apache2/sites-enabled/' + site + '.conf && '
            }
            if (fs.existsSync('/etc/apache2/sites-available/' + site + '.conf')) {
                _exec += 'sudo rm /etc/apache2/sites-available/' + site + '.conf && '
            }
            if (_exec.length > 0) {
                _exec += "sudo sed -i '/127\.0\.0\.1 *" + site + "$/d' " + config.hosts_path + " && sudo service apache2 restart && sudo service nginx restart"
                dir = exec(_exec, function (err, stdout, stderr) {
                    if (err) {
                        event.sender.send('system-res', 'error delete domain configs')
                        event.sender.send('system-res', stderr)
                    } else {
                        if (stdout) {
                            event.sender.send('system-res', stdout)
                        }
                        event.sender.send('system-res', 'domain configs deleted')
                    }
                    event.sender.send('rescan-sites')
                    event.sender.send('loader-hide')
                })
            }
        } else {
            event.sender.send('system-res', 'error open config')
            event.sender.send('loader-hide')
        }
    })
})

// enable checked php version
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
            event.sender.send('loader-hide')
        })
    }
})

// restart nginx
ipcMain.on('restart_nginx', (event, options) => {
    var _exec = 'sudo service nginx restart'
    dir = exec(_exec, function (err, stdout, stderr) {
        if (err) {
            event.sender.send('system-res', 'error restart nginx')
            event.sender.send('system-res', stderr)
        } else {
            if (stdout) {
                event.sender.send('system-res', stdout)
            }
            event.sender.send('system-res', 'nginx restarted')
        }
        event.sender.send('loader-hide')
    })
})

// restart apache
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
        event.sender.send('loader-hide')
    })
})

// show nginx error log
ipcMain.on('show_nginx_error_log', (event, options) => {
    var _log_file = '/var/log/nginx/error.log'
    if (fs.existsSync(_log_file)) {
        fs.readFile(_log_file, 'utf8', function (err, data) {
            event.sender.send('system-res', 'opening ...')
            if (err) {
                event.sender.send('system-res', 'error open file /var/log/nginx/error.log')
                event.sender.send('system-res', err)
            } else if (data) {
                var _to_editor = {
                    file: _log_file,
                    text: data,
                    be_save: false
                }
                event.sender.send('to-editor', _to_editor)
            } else {
                event.sender.send('system-res', 'file empty')
            }
            event.sender.send('loader-hide')
        })
    } else {
        event.sender.send('system-res', 'error.log: file not exist')
    }
})

// show nginx access log
ipcMain.on('show_nginx_access_log', (event, options) => {
    var _log_file = '/var/log/nginx/access.log'
    if (fs.existsSync(_log_file)) {
        fs.readFile(_log_file, 'utf8', function (err, data) {
            event.sender.send('system-res', 'opening ...')
            if (err) {
                event.sender.send('system-res', 'error open file /var/log/nginx/access.log')
                event.sender.send('system-res', err)
            } else if (data) {
                var _to_editor = {
                    file: _log_file,
                    text: data,
                    be_save: false
                }
                event.sender.send('to-editor', _to_editor)
            } else {
                event.sender.send('system-res', 'file empty')
            }
            event.sender.send('loader-hide')
        })
    } else {
        event.sender.send('system-res', 'access.log: file not exist')
    }
})

// show apache error log
ipcMain.on('show_apache_error_log', (event, options) => {
    var _log_file = '/var/log/apache2/error.log'
    if (fs.existsSync(_log_file)) {
        fs.readFile(_log_file, 'utf8', function (err, data) {
            event.sender.send('system-res', 'opening ...')
            if (err) {
                event.sender.send('system-res', 'error open file /var/log/apache2/error.log')
                event.sender.send('system-res', err)
            } else if (data) {
                var _to_editor = {
                    file: _log_file,
                    text: data,
                    be_save: false
                }
                event.sender.send('to-editor', _to_editor)
            } else {
                event.sender.send('system-res', 'file empty')
            }
            event.sender.send('loader-hide')
        })
    } else {
        event.sender.send('system-res', 'error.log: file not exist')
    }
})

// show apache access log
ipcMain.on('show_apache_access_log', (event, options) => {
    var _log_file = '/var/log/apache2/access.log'
    if (fs.existsSync(_log_file)) {
        fs.readFile(_log_file, 'utf8', function (err, data) {
            event.sender.send('system-res', 'opening ...')
            if (err) {
                event.sender.send('system-res', 'error open file /var/log/apache2/access.log')
                event.sender.send('system-res', err)
            } else if (data) {
                var _to_editor = {
                    file: _log_file,
                    text: data,
                    be_save: false
                }
                event.sender.send('to-editor', _to_editor)
            } else {
                event.sender.send('system-res', 'file empty')
            }
            event.sender.send('loader-hide')
        })
    } else {
        event.sender.send('system-res', 'access.log: file not exist')
    }
})

// edit sites config file for apache
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
                    var _to_editor = {
                        file: config.sites_conig_path,
                        text: data,
                        be_save: true
                    }
                    event.sender.send('to-editor', _to_editor)
                }
                event.sender.send('loader-hide')
            })
        } else {
            event.sender.send('system-res', 'error open config')
            event.sender.send('loader-hide')
        }
    })
})

// edit hosts file
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
                    var _to_editor = {
                        file: config.hosts_path,
                        text: data,
                        be_save: true
                    }
                    event.sender.send('to-editor', _to_editor)
                }
                event.sender.send('loader-hide')
            })
        } else {
            event.sender.send('system-res', 'error open config')
            event.sender.send('loader-hide')
        }
    })
})

// git clone repository
ipcMain.on('git_clone', (event, options) => {
    var _name = options.repo_name
    if (!_name.length > 0) {
        _name = options.repo.replace(/\s/g, '').split('/')[1].split('.')[0]
    }
    event.sender.send('system-res', 'clone ' + _name + '...')
    fs.readFile(configFile, 'utf8', function (err, data) {
        var config = JSON.parse(data)
        if (config && options.repo.length > 0) {
            var _exec = 'git clone ' + options.repo + ' ' + config.projects_path + _name
            dir = exec(_exec, function (err, stdout, stderr) {
                if (err) {
                    event.sender.send('system-res', 'error clone repo')
                    event.sender.send('system-res', stderr)
                } else {
                    event.sender.send('clear-inputs-git', ['git_clone', 'repo_name'])
                    if (stdout) {
                        event.sender.send('system-res', stdout)
                    }
                    event.sender.send('system-res', 'repo ' + _name + ' clone success')
                }
                event.sender.send('loader-hide')
            })
        } else {
            event.sender.send('system-res', 'error open config')
            event.sender.send('loader-hide')
        }
    })
})

// check forgotten commits
ipcMain.on('check_pushed', (event, options) => {
    fs.readFile(configFile, 'utf8', function (err, data) {
        var config = JSON.parse(data)
        if (config) {
            fs.readdir(config.projects_path, (err, directories) => {
                var _checked = []
                directories.forEach(function (directoire, idx) {
                    _checked.push(directoire)
                    if (directoire.charAt(0) !== '.' && fs.existsSync(config.projects_path + directoire + '/.git/')) {
                        var _exec = 'cd ' + config.projects_path + directoire + '/ && git cherry -v'
                        dir = exec(_exec, function (err, stdout, stderr) {
                            if (err) {
                                event.sender.send('system-res', 'error get git state')
                                event.sender.send('system-res', directoire)
                                event.sender.send('system-res', stderr)
                            } else {
                                if (stdout) {
                                    event.sender.send('system-res', stdout)
                                    event.sender.send('git-status-push', '_______________ ' + directoire + ' _______________\n' + stdout)
                                }
                            }
                        })
                    }
                })
                event.sender.send('system-res', 'checked ' + _checked.length + ' folders')
                event.sender.send('git-status-push', 'checked ' + _checked.length + ' folders\n')
                event.sender.send('loader-hide')
            })
        } else {
            event.sender.send('system-res', 'error open config')
            event.sender.send('loader-hide')
        }
    })
})

////////////////// ipc //////////////////////