ARG NODE_VERSION=22.4.1

FROM node:${NODE_VERSION}-alpine AS build

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies (reproducible install from lockfile)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Run the application
FROM node:${NODE_VERSION}-alpine AS prod

ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Hand ownership to the non-root user before dropping privileges
RUN chown -R node:node /usr/src/app

# Run as a non-root user
USER node

# Expose the application port (default is 3000 for NestJS)
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('net').connect(process.env.PORT || 3000, '127.0.0.1').on('connect', () => process.exit(0)).on('error', () => process.exit(1))"

# Start the NestJS application
CMD ["node", "dist/main"]
