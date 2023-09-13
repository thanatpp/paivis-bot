FROM oven/bun:1.0 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun build index.ts --compile --outfile server

FROM debian:bullseye
WORKDIR /app
COPY --from=builder /app/server /app/server
EXPOSE 3000
CMD ["/app/server"]