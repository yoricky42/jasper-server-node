# Filename: Dockerfile
FROM linuxserver/chromium:latest
USER root

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.

# Create working directory
WORKDIR /app

# Copy package.json
COPY package.json /app

# Install NPM dependencies for function
RUN npm install

# Copy handler function and tsconfig
COPY . /app

# Run app
CMD ["npm", "start"]