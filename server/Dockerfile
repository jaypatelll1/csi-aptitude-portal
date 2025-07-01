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

# Security: Optional non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["npm", "start"]
