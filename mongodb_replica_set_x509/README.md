# The purpose of this repository is to give a quick start to beginners in using mongodb replica set with x509 authentication

## for development environment, run

```bash
cd path-to-project-root-directory/ && \
    sudo chmod ug+x ./*.sh ./mongodb_scripts/*.sh && \
    ./prepare_environment_variables.sh --projectRootDirectory . --reset && \
    ./generate_certificates.sh --projectRootDirectory . && \
    sudo docker compose -f ./docker-compose.mongodb.yml --env-file ./.env.mongodb up -d --build --remove-orphans -V
```

and wait 100 seconds.
this would be your connection string "mongodb://localhost:8081/?authMechanism=MONGODB-X509&authSource=%24external&tls=true&tlsCAFile=/path/to/ca.crt&tlsCertificateKeyFile=/path/to/localhost.pem&tlsAllowInvalidHostnames=true&directConnection=true"

## for production environment, run

```bash
sudo docker swarm init && \
    sudo chmod ug+x ./*.sh ./mongodb/*.sh && \
    ./generate_certificates.sh --projectRootDirectory . && \
    ./recreate_secrets_mongodb.sh --projectRootDirectory . --useTestValues && \
    sudo docker stack deploy -c ./docker-compose.swarm.mongodb.yml app
```

and wait 100 seconds.

### caveats

If you want to connect from **localhost** you must only connect to one server and also set DirectConnection to true,\
this is because mongodb replica set returns dns names not ip addresses when client gets the list of replica set servers, obviously those dns names are only valid in docker compose network, not in localhost.

To customize subject values in certificates make sure to change the value in **both prepare_environment_variables.sh and generate_certificates.sh** files.

No ports are mapped in compose file for swarm because realistically in production database is not publicly available. (nut obviously you can add port mapping just to test everything)
