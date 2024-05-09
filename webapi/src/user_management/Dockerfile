FROM oven/bun:1 as base

RUN mkdir -p /indtall

WORKDIR /indtall
COPY package*.json bun.lockb ./
RUN bun install

FROM base as development

WORKDIR /app
COPY --from=base /indtall .
COPY . .

CMD sleep 60s && bun run dev
