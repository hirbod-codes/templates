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

if [[ ! -e "$projectRootDirectory/.env" || $reset == "true" ]]; then
    echo "DB_DATABASE_NAME=my_app_db
DB_ADMIN_USERNAME=hirbod
DB_PASSWORD=password
DB_SERVER_PORT=27017
DB_CONTAINER_PORT=8081
DB_USERNAME=CN=my_app,OU=my_other_org_unit,O=my_org
LOCALHOST_USERNAME=CN=localhost,OU=my_other_org_unit,O=my_org

" >$projectRootDirectory/.env
fi
