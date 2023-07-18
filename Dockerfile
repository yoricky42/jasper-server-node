# Filename: Dockerfile
FROM linuxserver/chromium:latest
USER root

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*


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