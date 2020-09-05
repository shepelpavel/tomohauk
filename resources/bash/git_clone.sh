#!/bin/bash

repo="$1"
addconfig="$2"
openbrowser="$3"
opencode="$4"

if [ "$repo" != "0" ]
then
    temp=${repo##*/}
    folder=${temp%.git*}
    sleep 0.1s
    echo -n $folder | xsel -ib
    echo "folder - ${folder}"
    sleep 0.1s
    git clone $repo /var/www/"$folder"
    echo "Repo ${repo} cloned."

    if [ $addconfig -eq "1" ]
    then
        sudo bash ./resources/bash/add_domain.sh "$folder"
    fi

    if [ $openbrowser -eq "1" ]
    then
        google-chrome http://${folder}/
    fi

    if [ $opencode -eq "1" ]
    then
        cd /var/www/${folder} && code -d .
    fi
else
    echo "Empty field"
fi