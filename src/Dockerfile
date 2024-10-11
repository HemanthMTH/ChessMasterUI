# Stage 1: Build the Angular app
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code to the container
COPY . .

# Build the Angular application for production
RUN npm run build -- --output-path=dist/chess-master-ui --configuration=production

# Stage 2: Serve the Angular app using NGINX
FROM nginx:alpine

# Copy the built Angular app from the previous stage to the NGINX web server directory
COPY --from=build /app/dist/chess-master-ui /usr/share/nginx/html

# Copy the custom NGINX configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
