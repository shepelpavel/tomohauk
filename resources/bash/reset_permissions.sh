#!/bin/bash

find /var/www -type d -exec chmod 755 {} \;
find /var/www -type f -exec chmod 644 {} \;