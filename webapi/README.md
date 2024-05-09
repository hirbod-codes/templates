```bash
docker compose -f src/user_management/compose.arangodb.sharded.yml -f compose.dev.yml up --build --remove-orphans
# or
docker rm -f $(docker ps -a)
docker volume rm $(docker volume ls -q)
docker buildx prune
docker compose -f src/user_management/compose.arangodb.sharded.yml -f compose.dev.yml up --build --remove-orphans
```
