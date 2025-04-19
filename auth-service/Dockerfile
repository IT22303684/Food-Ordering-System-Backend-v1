FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY common/package.json ./common/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the service
CMD ["yarn", "start"] 