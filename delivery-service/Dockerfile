FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package.json yarn.lock ./

# Set NODE_TLS_REJECT_UNAUTHORIZED to 0 for development
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3007

# Start the application
CMD ["yarn", "dev"]