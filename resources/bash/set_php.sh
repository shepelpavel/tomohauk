#!/bin/bash

a2dismod php7.4
a2dismod php7.3
a2dismod php7.2
a2dismod php7.1
a2dismod php7.0
a2dismod php5.6
a2enmod php"$1"
service apache2 restart
echo "set php${1}"