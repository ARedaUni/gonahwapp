FROM golang:1.22-alpine AS builder

WORKDIR /app

# Add edge testing repository and install dependencies
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && \
    apk add --no-cache \
    make \
    g++ \
    gcc \
    musl-dev \
    dart-sass

# Verify installation
RUN sass --version

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the applications
RUN make all

# Final stage
FROM alpine:3.19

WORKDIR /app

# Install sqlite3
RUN apk add --no-cache \
    sqlite \
    ca-certificates

# Copy binaries and necessary files
COPY --from=builder /app/bin/bro /app/bin/
COPY --from=builder /app/bin/nahwapp /app/bin/
COPY --from=builder /app/schema.sql /app/
COPY --from=builder /app/cmd/bro/quiz/*.json /app/cmd/bro/quiz/
COPY --from=builder /app/tls /app/tls

# Set environment variables
ENV DB_PATH=/app/data/default.db

# Create entrypoint script
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'cd /app' >> /app/entrypoint.sh && \
    echo 'mkdir -p $(dirname $DB_PATH)' >> /app/entrypoint.sh && \
    echo 'echo "Checking database path: $DB_PATH"' >> /app/entrypoint.sh && \
    echo 'if [ ! -f $DB_PATH ]; then' >> /app/entrypoint.sh && \
    echo '    echo "Database does not exist, creating..."' >> /app/entrypoint.sh && \
    echo '    bin/bro --db $DB_PATH create || { echo "Failed to create database"; exit 1; }' >> /app/entrypoint.sh && \
    echo '    if [ ! -z "$STUDENT_USER" ] && [ ! -z "$STUDENT_CODE" ]; then' >> /app/entrypoint.sh && \
    echo '        echo "Adding demo user..."' >> /app/entrypoint.sh && \
    echo '        bin/bro --db $DB_PATH add student --username $STUDENT_USER --code $STUDENT_CODE || { echo "Failed to add student"; exit 1; }' >> /app/entrypoint.sh && \
    echo '    fi' >> /app/entrypoint.sh && \
    echo 'else' >> /app/entrypoint.sh && \
    echo '    echo "Database exists"' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo 'echo "Starting nahwapp..."' >> /app/entrypoint.sh && \
    echo 'exec bin/nahwapp --dsn $DB_PATH "$@"' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
