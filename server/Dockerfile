FROM node:16 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .



FROM node:16-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

EXPOSE 3000

CMD ["npm", "start"]
