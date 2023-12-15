# Dockerizing Aurelia Applications

Docker is a powerful tool that allows developers to package applications into containers—standardized executable components combining application source code with the operating system (OS) libraries and dependencies required to run that code in any environment. Dockerizing an Aurelia 2 application can simplify deployment and ensure consistency across different environments. Here's a guide on how to Dockerize an Aurelia 2 application using TypeScript and leveraging Dependency Injection (DI) concepts.

## Prerequisites

- Ensure you have Docker installed on your machine. You can download it from [Docker's official website](https://www.docker.com/products/docker-desktop).
- An Aurelia 2 application created and ready to be containerized.

## Create a Dockerfile

The `Dockerfile` is a text document that contains all the commands a user could call on the command line to assemble an image. Create a `Dockerfile` in the root of your Aurelia 2 project with the following content:

```Dockerfile
# Step 1: Use the official Node.js 20 image as the base image
FROM node:20 AS build

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Step 4: Install project dependencies
RUN npm install

# Step 5: Copy the rest of the project files into the container
COPY . .

# Step 6: Build the Aurelia 2 project
RUN npm run build

# Step 7: Use Nginx to serve the application
FROM nginx:alpine

# Step 8: Copy the build artifacts from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Step 9: Expose port 80 to the outside once the container has launched
EXPOSE 80

# Step 10: Start Nginx and serve the application
CMD ["nginx", "-g", "daemon off;"]
```

This multi-stage build first creates a build of the Aurelia application and then sets up a lightweight Nginx server to serve the static files.

## Build the Docker Image

Run the following command to build the Docker image. Replace `your-app-name` with the name you wish to give your Docker image.

```bash
docker build -t your-app-name .
```

## Run the Docker Container

Once the image is built, you can run your Aurelia 2 application in a Docker container using:

```bash
docker run -d -p 8080:80 your-app-name
```

This command will start a Docker container with your Aurelia 2 application running on port 8080.

## Conclusion

By following these steps, you have successfully Dockerized your Aurelia 2 application, making it ready for easy deployment to any environment that supports Docker. Additionally, you've seen how to use Aurelia's DI system to manage services in a modern, type-safe manner using TypeScript.
