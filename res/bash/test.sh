#!/bin/bash

ls -a -1 /etc/apache2/mods-enabled/ | grep -E ^php[A-Za-z0-9]{1}.[A-Za-z0-9]{1}.load