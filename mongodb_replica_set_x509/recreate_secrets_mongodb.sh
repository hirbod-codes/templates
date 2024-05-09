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

if [[ $help == "true" || $h == "true" ]]; then
    echo "
projectRootDirectory  ==> required if useTestValues parameter is used.
useTestValues         ==> optional. creates secrets with fake test values.
"
    exit 0
fi

if [[ $useTestValues == "true" ]]; then
    if [[ -z $projectRootDirectory ]]; then
        echo "projectRootDirectory is a required parameter."
        exit 1
    elif [[ $projectRootDirectory == '/' ]]; then
        echo "Project root directory must not be system root '/'"
        exit 1
    fi

    DB_USERNAME=CN=my_app,OU=my_other_org_unit,O=my_org
    DB_ADMIN_USERNAME=hirbod
    DB_PASSWORD=password
    DB_DATABASE_NAME=my_app_db
    DB_SERVER_PORT=27017
    CA="$(cat $projectRootDirectory/security/ca/ca.crt)"
    CLUSTER_CA="$(cat $projectRootDirectory/security/ca/ca.crt)"
    REPLICA_SET_P_CRT="$(cat $projectRootDirectory/security/replicaSet_p/app.pem)"
    REPLICA_SET_P_MEMBER_CRT="$(cat $projectRootDirectory/security/replicaSet_p_member/app.pem)"
    REPLICA_SET_S_1_CRT="$(cat $projectRootDirectory/security/replicaSet_s_1/app.pem)"
    REPLICA_SET_S_1_MEMBER_CRT="$(cat $projectRootDirectory/security/replicaSet_s_1_member/app.pem)"
    REPLICA_SET_S_2_CRT="$(cat $projectRootDirectory/security/replicaSet_s_2/app.pem)"
    REPLICA_SET_S_2_MEMBER_CRT="$(cat $projectRootDirectory/security/replicaSet_s_2_member/app.pem)"
fi

sudo docker secret rm $(sudo docker secret ls -q)

if [[ -z $DB_SERVER_PORT ]];                            then echo "DB_SERVER_PORT                           parameter is required."; exit 1; fi
if [[ -z $CA ]];                                        then echo "CA                                       parameter is required."; exit 1; fi
if [[ -z $CLUSTER_CA ]];                                then echo "CLUSTER_CA                               parameter is required."; exit 1; fi
if [[ -z $DB_DATABASE_NAME ]];                          then echo "DB_DATABASE_NAME                         parameter is required."; exit 1; fi
if [[ -z $DB_ADMIN_USERNAME ]];                         then echo "DB_ADMIN_USERNAME                        parameter is required."; exit 1; fi
if [[ -z $DB_USERNAME ]];                               then echo "DB_USERNAME                              parameter is required."; exit 1; fi
if [[ -z $DB_PASSWORD ]];                               then echo "DB_PASSWORD                              parameter is required."; exit 1; fi
if [[ -z $REPLICA_SET_P_CRT ]];                         then echo "REPLICA_SET_P_CRT                        parameter is required."; exit 1; fi
if [[ -z $REPLICA_SET_P_MEMBER_CRT ]];                  then echo "REPLICA_SET_P_MEMBER_CRT                 parameter is required."; exit 1; fi
if [[ -z $REPLICA_SET_S_1_CRT ]];                       then echo "REPLICA_SET_S_1_CRT                      parameter is required."; exit 1; fi
if [[ -z $REPLICA_SET_S_1_MEMBER_CRT ]];                then echo "REPLICA_SET_S_1_MEMBER_CRT               parameter is required."; exit 1; fi
if [[ -z $REPLICA_SET_S_2_CRT ]];                       then echo "REPLICA_SET_S_2_CRT                      parameter is required."; exit 1; fi
if [[ -z $REPLICA_SET_S_2_MEMBER_CRT ]];                then echo "REPLICA_SET_S_2_MEMBER_CRT               parameter is required."; exit 1; fi

echo "$DB_SERVER_PORT"                              | sudo docker secret create DB_SERVER_PORT -
echo "$CA"                                          | sudo docker secret create CA -
echo "$CLUSTER_CA"                                  | sudo docker secret create CLUSTER_CA -
echo "$DB_DATABASE_NAME"                            | sudo docker secret create DB_DATABASE_NAME -
echo "$DB_ADMIN_USERNAME"                           | sudo docker secret create DB_ADMIN_USERNAME -
echo "$DB_USERNAME"                                 | sudo docker secret create DB_USERNAME -
echo "$DB_PASSWORD"                                 | sudo docker secret create DB_PASSWORD -
echo "$REPLICA_SET_P_CRT"                           | sudo docker secret create REPLICA_SET_P_CRT -
echo "$REPLICA_SET_P_MEMBER_CRT"                    | sudo docker secret create REPLICA_SET_P_MEMBER_CRT -
echo "$REPLICA_SET_S_1_CRT"                         | sudo docker secret create REPLICA_SET_S_1_CRT -
echo "$REPLICA_SET_S_1_MEMBER_CRT"                  | sudo docker secret create REPLICA_SET_S_1_MEMBER_CRT -
echo "$REPLICA_SET_S_2_CRT"                         | sudo docker secret create REPLICA_SET_S_2_CRT -
echo "$REPLICA_SET_S_2_MEMBER_CRT"                  | sudo docker secret create REPLICA_SET_S_2_MEMBER_CRT -
