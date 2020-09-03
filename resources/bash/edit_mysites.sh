#!/bin/bash

RESULT='mysites.conf opened in editor...'
code /etc/apache2/sites-available/mysites.conf
echo "${RESULT}"