# ============================================
# Multi-stage build for minimal image
# ============================================

# Stage 1: Build
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /api-gateway ./cmd/main.go

# Stage 2: Runtime (tiny image)
FROM alphine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app
COPY --from=builder /api-gateway .

EXPOSE 8080

CMD ["./api-gateway"]
