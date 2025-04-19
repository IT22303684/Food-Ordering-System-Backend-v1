FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock separately
COPY package.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the service
CMD ["yarn", "start"]