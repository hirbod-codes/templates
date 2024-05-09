#!/bin/bash

while [ $# -gt 0 ]; do
    if [[ $1 == "--"* ]]; then
        if [[ -n $2 && $2 != "-"* ]]; then
            v="${1/--/}"
            declare $v="$2"
        else
            v="${1/--/}"
            declare $v="true"
        fi
    elif [[ $1 == "-"* ]]; then
        if [[ -n $2 && $2 != "-"* ]]; then
            v="${1/-/}"
            declare $v="$2"
        else
            v="${1/-/}"
            declare $v="true"
        fi
    fi

    shift
done

if [[ $useTestValues == "true" ]]; then
    if [[ -z $projectRootDirectory ]]; then
        echo "projectRootDirectory is a required parameter."
        exit 1
    elif [[ $projectRootDirectory == '/' ]]; then
        echo "Project root directory must not be system root '/'"
        exit 1
    fi

    DB_USERNAME="CN=my_app,OU=my_other_org_unit,O=my_org"
    DB_ADMIN_USERNAME="hirbod"
    DB_PASSWORD="password"
    DB_DATABASE_NAME="my_app_db"
    DB_SERVER_PORT=27017
    CA="$(cat $projectRootDirectory/security/ca/ca.crt)"
    MONGODB_TLS_CLUSTER_FILE="$(cat $projectRootDirectory/security/mongodb_member/app.pem)"
    MONGODB_TLS_CERTIFICATE_KEY_FILE="$(cat $projectRootDirectory/security/mongodb/app.pem)"
    CONFIG_1_TLS_CLUSTER_FILE="$(cat $projectRootDirectory/security/configServer1_member/app.pem)"
    CONFIG_1_TLS_CERTIFICATE_KEY_FILE="$(cat $projectRootDirectory/security/configServer1/app.pem)"
    CONFIG_2_TLS_CLUSTER_FILE="$(cat $projectRootDirectory/security/configServer2_member/app.pem)"
    CONFIG_2_TLS_CERTIFICATE_KEY_FILE="$(cat $projectRootDirectory/security/configServer2/app.pem)"
    CONFIG_3_TLS_CLUSTER_FILE="$(cat $projectRootDirectory/security/configServer3_member/app.pem)"
    CONFIG_3_TLS_CERTIFICATE_KEY_FILE="$(cat $projectRootDirectory/security/configServer3/app.pem)"
    SHARD_1_TLS_CLUSTER_FILE="$(cat $projectRootDirectory/security/shardServer1_member/app.pem)"
    SHARD_1_TLS_CERTIFICATE_KEY_FILE="$(cat $projectRootDirectory/security/shardServer1/app.pem)"
    SHARD_2_TLS_CLUSTER_FILE="$(cat $projectRootDirectory/security/shardServer2_member/app.pem)"
    SHARD_2_TLS_CERTIFICATE_KEY_FILE="$(cat $projectRootDirectory/security/shardServer2/app.pem)"
    SHARD_3_TLS_CLUSTER_FILE="$(cat $projectRootDirectory/security/shardServer3_member/app.pem)"
    SHARD_3_TLS_CERTIFICATE_KEY_FILE="$(cat $projectRootDirectory/security/shardServer3/app.pem)"
fi

sudo docker secret rm $(sudo docker secret ls -q)

if [[ -z $DB_USERNAME ]]; then                              echo "DB_USERNAME                              parameter is required."; exit 1;fi
if [[ -z $DB_ADMIN_USERNAME ]]; then                        echo "DB_ADMIN_USERNAME                        parameter is required."; exit 1;fi
if [[ -z $DB_PASSWORD ]]; then                              echo "DB_PASSWORD                              parameter is required."; exit 1;fi
if [[ -z $DB_DATABASE_NAME ]]; then                         echo "DB_DATABASE_NAME                         parameter is required."; exit 1;fi
if [[ -z $DB_SERVER_PORT ]]; then                           echo "DB_SERVER_PORT                           parameter is required."; exit 1;fi
if [[ -z $CA ]]; then                                       echo "CA                                       parameter is required."; exit 1;fi

if [[ -z $MONGODB_TLS_CLUSTER_FILE ]]; then                 echo "MONGODB_TLS_CLUSTER_FILE                 parameter is required."; exit 1;fi
if [[ -z $MONGODB_TLS_CERTIFICATE_KEY_FILE ]]; then         echo "MONGODB_TLS_CERTIFICATE_KEY_FILE         parameter is required."; exit 1;fi
if [[ -z $CONFIG_1_TLS_CLUSTER_FILE ]]; then                echo "CONFIG_1_TLS_CLUSTER_FILE                parameter is required."; exit 1;fi
if [[ -z $CONFIG_1_TLS_CERTIFICATE_KEY_FILE ]]; then        echo "CONFIG_1_TLS_CERTIFICATE_KEY_FILE        parameter is required."; exit 1;fi
if [[ -z $CONFIG_2_TLS_CLUSTER_FILE ]]; then                echo "CONFIG_2_TLS_CLUSTER_FILE                parameter is required."; exit 1;fi
if [[ -z $CONFIG_2_TLS_CERTIFICATE_KEY_FILE ]]; then        echo "CONFIG_2_TLS_CERTIFICATE_KEY_FILE        parameter is required."; exit 1;fi
if [[ -z $CONFIG_3_TLS_CLUSTER_FILE ]]; then                echo "CONFIG_3_TLS_CLUSTER_FILE                parameter is required."; exit 1;fi
if [[ -z $CONFIG_3_TLS_CERTIFICATE_KEY_FILE ]]; then        echo "CONFIG_3_TLS_CERTIFICATE_KEY_FILE        parameter is required."; exit 1;fi
if [[ -z $SHARD_1_TLS_CLUSTER_FILE ]]; then                 echo "SHARD_1_TLS_CLUSTER_FILE                 parameter is required."; exit 1;fi
if [[ -z $SHARD_1_TLS_CERTIFICATE_KEY_FILE ]]; then         echo "SHARD_1_TLS_CERTIFICATE_KEY_FILE         parameter is required."; exit 1;fi
if [[ -z $SHARD_2_TLS_CLUSTER_FILE ]]; then                 echo "SHARD_2_TLS_CLUSTER_FILE                 parameter is required."; exit 1;fi
if [[ -z $SHARD_2_TLS_CERTIFICATE_KEY_FILE ]]; then         echo "SHARD_2_TLS_CERTIFICATE_KEY_FILE         parameter is required."; exit 1;fi
if [[ -z $SHARD_3_TLS_CLUSTER_FILE ]]; then                 echo "SHARD_3_TLS_CLUSTER_FILE                 parameter is required."; exit 1;fi
if [[ -z $SHARD_3_TLS_CERTIFICATE_KEY_FILE ]]; then         echo "SHARD_3_TLS_CERTIFICATE_KEY_FILE         parameter is required."; exit 1;fi

echo "$DB_USERNAME"                               | sudo docker secret create DB_USERNAME -
echo "$DB_ADMIN_USERNAME"                         | sudo docker secret create DB_ADMIN_USERNAME -
echo "$DB_PASSWORD"                               | sudo docker secret create DB_PASSWORD -
echo "$DB_DATABASE_NAME"                          | sudo docker secret create DB_DATABASE_NAME -
echo "$DB_SERVER_PORT"                            | sudo docker secret create DB_SERVER_PORT -
echo "$CA"                                        | sudo docker secret create CA -

echo "$MONGODB_TLS_CLUSTER_FILE"                  | sudo docker secret create MONGODB_TLS_CLUSTER_FILE -
echo "$MONGODB_TLS_CERTIFICATE_KEY_FILE"          | sudo docker secret create MONGODB_TLS_CERTIFICATE_KEY_FILE -
echo "$CONFIG_1_TLS_CLUSTER_FILE"                 | sudo docker secret create CONFIG_1_TLS_CLUSTER_FILE -
echo "$CONFIG_1_TLS_CERTIFICATE_KEY_FILE"         | sudo docker secret create CONFIG_1_TLS_CERTIFICATE_KEY_FILE -
echo "$CONFIG_2_TLS_CLUSTER_FILE"                 | sudo docker secret create CONFIG_2_TLS_CLUSTER_FILE -
echo "$CONFIG_2_TLS_CERTIFICATE_KEY_FILE"         | sudo docker secret create CONFIG_2_TLS_CERTIFICATE_KEY_FILE -
echo "$CONFIG_3_TLS_CLUSTER_FILE"                 | sudo docker secret create CONFIG_3_TLS_CLUSTER_FILE -
echo "$CONFIG_3_TLS_CERTIFICATE_KEY_FILE"         | sudo docker secret create CONFIG_3_TLS_CERTIFICATE_KEY_FILE -
echo "$SHARD_1_TLS_CLUSTER_FILE"                  | sudo docker secret create SHARD_1_TLS_CLUSTER_FILE -
echo "$SHARD_1_TLS_CERTIFICATE_KEY_FILE"          | sudo docker secret create SHARD_1_TLS_CERTIFICATE_KEY_FILE -
echo "$SHARD_2_TLS_CLUSTER_FILE"                  | sudo docker secret create SHARD_2_TLS_CLUSTER_FILE -
echo "$SHARD_2_TLS_CERTIFICATE_KEY_FILE"          | sudo docker secret create SHARD_2_TLS_CERTIFICATE_KEY_FILE -
echo "$SHARD_3_TLS_CLUSTER_FILE"                  | sudo docker secret create SHARD_3_TLS_CLUSTER_FILE -
echo "$SHARD_3_TLS_CERTIFICATE_KEY_FILE"          | sudo docker secret create SHARD_3_TLS_CERTIFICATE_KEY_FILE -
