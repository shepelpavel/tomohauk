#!/bin/bash

hosts=/etc/hosts
mysites=/etc/apache2/sites-available/mysites.conf
hosts_str_start=$(grep -n '#start-local-www' $hosts | sed 's/^\([0-9]\+\):.*$/\1/')
hosts_str_end=$(grep -n '#end-local-www' $hosts | sed 's/^\([0-9]\+\):.*$/\1/')
dirs=$(ls /var/www/)
dirs_array=($dirs)

if [ "$hosts_str_start" = "" ] || [ "$hosts_str_end" = "" ] || [ "$dirs" = "" ]
then
    echo "Empty hosts start key (${hosts_str_start}), or end key (${hosts_str_end}), or dirs (${dirs})"
else
    str_first=$(($hosts_str_start+1))
    str_last=$(($hosts_str_end-1))
    sed -i "${str_first},${str_last}d" $hosts
    > $mysites
    
    for ((i=0; i<${#dirs_array[*]}; i++))
    do
        sed -i "${hosts_str_start}a\127.0.0.1    ${dirs_array[$i]}" $hosts
        echo "<VirtualHost *:80>"                           >> $mysites
        echo "    ServerName ${dirs_array[$i]}"             >> $mysites
        echo "    DocumentRoot /var/www/${dirs_array[$i]}"  >> $mysites
        echo "    <IfModule mpm_itk_module>" 				>> $mysites
        echo "        AssignUserId shepel shepel" 			>> $mysites
        echo "    </IfModule>" 								>> $mysites
        echo "    <Directory /var/www/${dirs_array[$i]}>"   >> $mysites
        echo "        Options Indexes FollowSymLinks"       >> $mysites
        echo "        AllowOverride All"                    >> $mysites
        echo "        Require all granted"                  >> $mysites
        echo "    </Directory>"                             >> $mysites
        echo "</VirtualHost>"                               >> $mysites
    done
    service apache2 restart
    echo "Dirs rescan complite."
fi