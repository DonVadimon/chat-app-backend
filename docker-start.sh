#!/bin/bash

cp ./chat-api/tsconfig.json ./tsconfig.json

if [ "$1" = "prod" ]
then
    echo "\033[32;1;45m Docker starts for production \033[0m";
    shift;
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up "$@";
elif [ "$1" = "face-api-only" ]
then
    echo "\033[32;1;45m Docker starts for production with FaceAPI api only \033[0m";
    shift;
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.face.api-only.yml up "$@";
else
    echo "\033[32;1;45m Docker starts for development \033[0m";
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up "$@";
fi
