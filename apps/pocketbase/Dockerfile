# ╔═════════════════════════════════════════════════════╗
# ║                       BUILD                         ║
# ╚═════════════════════════════════════════════════════╝
FROM golang:1.27-alpine AS build

WORKDIR /app

# Download CA certs
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Specify PocketBase target version
ARG POCKETBASE_VERSION=0.39.10

# Copy Go manifests & source files
COPY go.mod go.sum ./
COPY main.go ./
COPY migrations ./migrations

# Fetch requested PocketBase version and update dependencies
RUN go get github.com/pocketbase/pocketbase@v${POCKETBASE_VERSION} && go mod tidy

# Build static binary with Go cache mounts
ARG TARGETOS TARGETARCH
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOGC=75 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -ldflags "-w -s" -o /pocketbase .

# ╔═════════════════════════════════════════════════════╗
# ║                       IMAGE                         ║
# ╚═════════════════════════════════════════════════════╝
FROM scratch

WORKDIR /pb

# Copy binary & SSL certificates
COPY --from=build /pocketbase /pb/
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy PocketBase JS hooks AND JS migrations
COPY pb_hooks /pb/pb_hooks
COPY pb_migrations /pb/pb_migrations

# Declare data directory volume for database persistence
VOLUME ["/pb/pb_data"]

EXPOSE 8090

ENTRYPOINT [ "/pb/pocketbase" ]
CMD ["serve", "--http=0.0.0.0:8090", "--encryptionEnv=POCKETBASE_ENCRYPTION_KEY"]
