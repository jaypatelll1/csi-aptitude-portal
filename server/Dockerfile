# Build Stage
FROM public.ecr.aws/docker/library/node:22.13-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Production Image
FROM public.ecr.aws/docker/library/node:22.13-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

# Security: Create non-root user and required directories
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /app/exports /app/uploads && \
    chown -R appuser:appgroup /app/exports /app/uploads
USER appuser

EXPOSE 3000
CMD ["npm", "start"]

