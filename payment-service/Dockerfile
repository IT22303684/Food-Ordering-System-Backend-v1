# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your service runs on (change if your service uses a different port)
EXPOSE 5002

# Start the service
CMD ["node", "index.js"]
