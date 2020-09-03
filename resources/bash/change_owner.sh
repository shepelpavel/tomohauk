#!/bin/bash

owner="$1"
chown -R ${owner}:${owner} /var/www
echo "Owner is ${owner}"