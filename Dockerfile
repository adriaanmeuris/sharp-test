# Base image (glibc-based)
FROM --platform=linux/amd64 node:16.20-bookworm-slim as base-glibc

# Use jemalloc as memory allocator
#RUN apt-get update && apt-get install -y libjemalloc-dev
#ENV LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libjemalloc.so"

# Base image (musl-based)
FROM node:16.20-alpine3.18 as base-musl

# App
FROM base-glibc
#FROM base-musl

# Put in workdir
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Production
RUN npm ci
COPY / ./
CMD ["node", "index.js"]
