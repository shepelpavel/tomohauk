#!/bin/bash

domain="$1"
hosts=/etc/hosts
mysites=/etc/apache2/sites-available/mysites.conf
hosts_str_start=$(grep -n '#start-local-www' $hosts | sed 's/^\([0-9]\+\):.*$/\1/')
hosts_str_end=$(grep -n '#end-local-www' $hosts | sed 's/^\([0-9]\+\):.*$/\1/')

if [ "$hosts_str_start" = "" ] || [ "$hosts_str_end" = "" ]
then
    echo "Empty hosts start key (${hosts_str_start}), or end key (${hosts_str_end})"
else
    sed -i "${hosts_str_start}a\127.0.0.1    $domain"   $hosts
    echo "<VirtualHost *:80>"                           >> $mysites
    echo "    ServerName $domain"                       >> $mysites
    echo "    DocumentRoot /var/www/$domain"            >> $mysites
    echo "    <IfModule mpm_itk_module>"                >> $mysites
    echo "        AssignUserId shepel shepel"           >> $mysites
    echo "    </IfModule>"                              >> $mysites
    echo "    <Directory /var/www/$domain>"             >> $mysites
    echo "        Options Indexes FollowSymLinks"       >> $mysites
    echo "        AllowOverride All"                    >> $mysites
    echo "        Require all granted"                  >> $mysites
    echo "    </Directory>"                             >> $mysites
    echo "</VirtualHost>"                               >> $mysites
    service apache2 restart
    echo "Domain added."
fi