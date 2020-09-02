#!/bin/bash

sudo a2dismod php7.4
sudo a2dismod php7.3
sudo a2dismod php7.2
sudo a2dismod php7.1
sudo a2dismod php7.0
sudo a2dismod php5.6
sudo a2enmod php7.3
sudo service apache2 restart
echo 'set php7.3'