# ╔═════════════════════════════════════════════════════╗
# ║                       BUILD                         ║
# ╚═════════════════════════════════════════════════════╝
FROM golang:1.24.4-alpine AS build

WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source files
COPY main.go ./
COPY migrations ./migrations

RUN apk add --no-cache \
    unzip \
    ca-certificates

RUN update-ca-certificates

# Build
ARG TARGETOS TARGETARCH
RUN CGO_ENABLED=0 GOGC=75 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -ldflags "-w -s" -o /pocketbase .
 
# ╔═════════════════════════════════════════════════════╗
# ║                       IMAGE                         ║
# ╚═════════════════════════════════════════════════════╝
FROM scratch

WORKDIR /pb

COPY --from=build /pocketbase /pb/
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY pb_hooks /pb/pb_hooks

EXPOSE 8090

ENTRYPOINT [ "/pb/pocketbase" ]
CMD ["serve", "--http=0.0.0.0:8090", "--encryptionEnv=POCKETBASE_ENCRYPTION_KEY"]
