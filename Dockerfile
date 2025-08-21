# Stage 1: Build the Angular application
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build -- --configuration production

# Stage 2: Serve the application from Nginx
FROM nginx:alpine

# Copy the build output to replace the default Nginx content.
COPY --from=build /app/dist/virtual-try-on/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80
