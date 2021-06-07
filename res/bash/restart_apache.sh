#!/bin/bash

RESULT=$(service apache2 restart)
if [ -z "$RESULT" ]
then
    RESULT='done'
    echo "${RESULT} - Apache restarted"
else
    RESULT='error'
    echo "${RESULT}"
fi