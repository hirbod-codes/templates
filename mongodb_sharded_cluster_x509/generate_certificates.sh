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

# Validating Arguments
if [[ -z $projectRootDirectory ]]; then
    echo "projectRootDirectory is a required parameter."
    exit 1
elif [[ $projectRootDirectory == '/' ]]; then
    echo "Project root directory must not be system root '/'"
    exit 1
fi

sudo rm -fr $projectRootDirectory/security

echo "#########################"
echo "#########################"
mkdir -p $projectRootDirectory/security/ca
openssl genrsa -out $projectRootDirectory/security/ca/ca.key
openssl req -x509 -sha256 -config ca.cnf -key $projectRootDirectory/security/ca/ca.key -out $projectRootDirectory/security/ca/ca.crt -subj /O=my_org/OU=my_org_unit/CN=my_app_certificate_authority
echo ""

# Clients
## note that OU value in subject for clients needs to be different, so that they are distinguished from internal server members of mongodb sharded cluster.
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/localhost --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_other_org_unit --cn localhost"
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/my_app --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_other_org_unit --cn my_app --san my_app -shouldExportPkcs12"

# Servers

## Sharded cluster
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/mongodb --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn mongodb --san mongodb"
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/mongodb_member --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn mongodb --san mongodb"

bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/configServer1 --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn configServer1 --san configServer1"
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/configServer1_member --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn configServer1 --san configServer1"

bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/configServer2 --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn configServer2 --san configServer2"
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/configServer2_member --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn configServer2 --san configServer2"

bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/configServer3 --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn configServer3 --san configServer1"
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/configServer3_member --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn configServer3 --san configServer3"

bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/shardServer1 --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn shardServer1 --san shardServer1"
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/shardServer1_member --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn shardServer1 --san shardServer1"

bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/shardServer2 --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn shardServer2 --san shardServer2"
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/shardServer2_member --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn shardServer2 --san shardServer2"

bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/shardServer3 --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn shardServer3 --san shardServer3"
bash -c "./generate_certificate.sh --dir $projectRootDirectory/security/shardServer3_member --caCrt $projectRootDirectory/security/ca/ca.crt --caKey $projectRootDirectory/security/ca/ca.key --configFile client.cnf --extensions req_ext --ou my_org_unit --cn shardServer3 --san shardServer3"
