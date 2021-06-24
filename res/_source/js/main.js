var _options = {
    projects_path: "/var/www/",
    hosts_path: "/etc/hosts",
    sites_conig_path: "/etc/apache2/sites-available/mysites.conf"
}

var errorlog = `[Thu Jun 24 00:00:17.861492 2021] [mpm_prefork:notice] [pid 1413] AH00163: Apache/2.4.41 (Ubuntu) mpm-itk/2.4.7-04 configured -- resuming normal operations
[Thu Jun 24 00:00:17.861510 2021] [core:notice] [pid 1413] AH00094: Command line: "/usr/sbin/apache2"`
var accesslog = 'access.log text'
var sites_conig = `<VirtualHost *:80>
    ServerName tomohauk
    DocumentRoot /var/www/tomohauk
    <Directory /var/www/tomohauk>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>`
var hosts = `127.0.0.1       localhost
127.0.1.1       shepel-nix`

function ipcRenderer(event, options = '') {
    switch (event) {
        case 'write_settings':
            setTimeout(() => {
                eventSenderSend('system-res', 'settings saved')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        case 'save_file':
            setTimeout(() => {
                eventSenderSend('system-res', 'file saved')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        case 'set_php_ver':
            setTimeout(() => {
                eventSenderSend('system-res', 'change php version ...')
                eventSenderSend('php-current', options.en_ver)
                eventSenderSend('system-res', 'apache restarted ...')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        case 'restart_apache':
            setTimeout(() => {
                eventSenderSend('system-res', 'apache restarted')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        case 'show_error_log':
            eventSenderSend('system-res', 'open file /var/log/apache2/error.log ...')
            eventSenderSend('to-editor', errorlog)
            eventSenderSend('loader-hide')
            break;
        case 'show_access_log':
            eventSenderSend('system-res', 'open file /var/log/apache2/access.log ...')
            eventSenderSend('to-editor', accesslog)
            eventSenderSend('loader-hide')
            break;
        case 'edit_mysites_conf':
            eventSenderSend('system-res', 'opening ...')
            eventSenderSend('to-editor', sites_conig)
            eventSenderSend('loader-hide')
            break;
        case 'edit_hosts':
            eventSenderSend('system-res', 'opening ...')
            eventSenderSend('to-editor', hosts)
            eventSenderSend('loader-hide')
            break;
        case 'git_clone':
            var _name = options.repo_name
            eventSenderSend('system-res', 'clone ' + _name + '...')
            setTimeout(() => {
                eventSenderSend('clear-inputs-git', ['git_clone', 'repo_name'])
                eventSenderSend('system-res', 'repo ' + _name + ' clone success')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        case 'check_pushed':
            setTimeout(() => {
                eventSenderSend('system-res', 'checked 115 folders')
                eventSenderSend('git-status-push', 'checked 115 folders\n')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        default:
            break;
    }
}