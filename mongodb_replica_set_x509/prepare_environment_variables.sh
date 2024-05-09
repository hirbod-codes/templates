#!/bin/bash

while [ $# -gt 0 ]; do
    if [[ $1 == "--"* || $reset == "true" ]]; then
        if [[ -n $2 && $2 != "-"* || $reset == "true" ]]; then
            v="${1/--/}"
            declare $v="$2"
        else
            v="${1/--/}"
            declare $v="true"
        fi
    elif [[ $1 == "-"* ]]; then
        if [[ -n $2 && $2 != "-"* || $reset == "true" ]]; then
            v="${1/-/}"
            declare $v="$2"
        else
            v="${1/-/}"
            declare $v="true"
        fi
    fi

    shift
done

# Validating Arguments
if [[ -z $projectRootDirectory ]]; then
    echo "Insufficient arguments"
    exit
elif [[ $projectRootDirectory == '/' ]]; then
    echo "Project root directory must not be system root '/'"
    exit
fi

# ----------------------------------------------------------------------------------------------------------------------------------------------------

if [[ ! -e "$projectRootDirectory/.env.mongodb" || $reset == "true" ]]; then
    echo "DB_DATABASE_NAME=my_app_db
DB_USERNAME=hirbod
DB_PASSWORD=password
DB_SERVER_PORT=27017
DB_PRIMARY_CONTAINER_PORT=8081
DB_SECONDARY_1_CONTAINER_PORT=8082
DB_SECONDARY_2_CONTAINER_PORT=8083
CRT_USERNAME=CN=my_app,OU=my_other_org_unit,O=my_org
LOCALHOST_USERNAME=CN=localhost,OU=my_other_org_unit,O=my_org

" >$projectRootDirectory/.env.mongodb
fi
