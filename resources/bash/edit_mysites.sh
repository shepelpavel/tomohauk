#!/bin/bash

RESULT='mysites.conf opened in editor...'
xed /etc/apache2/sites-available/mysites.conf
echo "${RESULT}"