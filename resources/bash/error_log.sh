#!/bin/bash

RESULT='error.log opened in editor...'
xed /var/log/apache2/error.log
echo "${RESULT}"