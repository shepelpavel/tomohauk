var _options = {
    projects_path: "/var/www/",
    hosts_path: "/etc/hosts",
}

var apacheerrorlog = `[Thu Jun 24 00:00:17.861492 2021] [mpm_prefork:notice] [pid 1413] AH00163: Apache/2.4.41 (Ubuntu) mpm-itk/2.4.7-04 configured -- resuming normal operations
[Thu Jun 24 00:00:17.861510 2021] [core:notice] [pid 1413] AH00094: Command line: "/usr/sbin/apache2"`
var apacheaccesslog = 'access.log text'
var nginxerrorlog = '2021/06/30 17:46:48 [error] 80922#80922: *1 FastCGI sent in stderr: "PHP message: PHP Warning:  mysqli_connect(): (HY000/1049): Unknown database "test" in /files/www/test/public/core/config.php on line 26" while reading response header from upstream, client: 127.0.0.1, server: test, request: "GET / HTTP/1.1", upstream: "fastcgi://unix:/run/php/php7.4-fpm.sock:", host: "test"'
var nginxaccesslog = '127.0.0.1 - - [01/Jul/2021:08:38:15 +0300] "GET / HTTP/1.1" 200 1239 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"'
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
var nginxsiteconfig = `server {
    listen 80;
    listen [::]:80;
    root /var/www/test;
    index index.html index.php;
    server_name test;
    location / {
        try_files $uri $uri/ =404;
    }
}`

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
        case 'add_domain':
            setTimeout(() => {
                eventSenderSend('system-res', 'domain added')
                eventSenderSend('clear-inputs-domain')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        case 'edit_site_config':
            eventSenderSend('to-editor', nginxsiteconfig)
            break;
        case 'edit_site_config_apache':
            eventSenderSend('to-editor', sites_conig)
            break;
        case 'restart_apache':
            setTimeout(() => {
                eventSenderSend('system-res', 'apache restarted')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        case 'restart_nginx':
            setTimeout(() => {
                eventSenderSend('system-res', 'nginx restarted')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        case 'show_nginx_error_log':
            eventSenderSend('system-res', 'open file /var/log/nginx/error.log ...')
            eventSenderSend('to-editor', nginxerrorlog)
            eventSenderSend('loader-hide')
            break;
        case 'show_nginx_access_log':
            eventSenderSend('system-res', 'open file /var/log/nginx/access.log ...')
            eventSenderSend('to-editor', nginxaccesslog)
            eventSenderSend('loader-hide')
            break;
        case 'show_apache_error_log':
            eventSenderSend('system-res', 'open file /var/log/apache2/error.log ...')
            eventSenderSend('to-editor', apacheerrorlog)
            eventSenderSend('loader-hide')
            break;
        case 'show_apache_access_log':
            eventSenderSend('system-res', 'open file /var/log/apache2/access.log ...')
            eventSenderSend('to-editor', apacheaccesslog)
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
                eventSenderSend('system-res', '+ 975679050eb02aeb53c26f7a257c9fe15d6edb23 feat: update demo')
                eventSenderSend('git-status-push', 'checked 115 folders\n\n_______________ tomohauk _______________\n+ 975679050eb02aeb53c26f7a257c9fe15d6edb23 feat: update demo\n')
                eventSenderSend('loader-hide')
            }, 1000);
            break;
        default:
            break;
    }
}