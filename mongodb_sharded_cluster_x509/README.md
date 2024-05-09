# The purpose of this repository is to give a quick start to beginners in using mongodb sharded cluster with x509 authentication

## for development environment, run

```bash
cd path-to-project-root-directory/ && \
    sudo chmod ug+x ./*.sh ./mongodb_scripts/*.sh && \
    ./prepare_environment_variables.sh --projectRootDirectory . --reset && \
    ./generate_certificates.sh --projectRootDirectory . && \
    sudo docker compose -f ./docker-compose.mongodb.yml --env-file ./.env up -d --build --remove-orphans -V
```

and wait 240 seconds.
this would be your connection string "mongodb://localhost:8081/?authMechanism=MONGODB-X509&authSource=%24external&tls=true&tlsCAFile=/path/to/ca.crt&tlsCertificateKeyFile=/path/to/localhost.pem&tlsAllowInvalidHostnames=true&directConnection=true"

## for production environment, run

```bash
sudo docker swarm init && \
    sudo chmod ug+x ./*.sh ./mongodb_scripts/*.sh && \
    ./generate_certificates.sh --projectRootDirectory . && \
    ./recreate_secrets_mongodb.sh --projectRootDirectory . --useTestValues && \
    sudo docker stack deploy -c ./docker-compose.swarm.mongodb.yml app
```

and wait 240 seconds.

### caveats

To customize subject values in certificates make sure to change the value in both prepare_environment_variables.sh and generate_certificates.sh files.
No ports are mapped in compose file for swarm because realistically in production database is not publicly available. (nut obviously you can add port mapping just to test everything)
