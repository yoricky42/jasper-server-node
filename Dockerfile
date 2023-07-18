# Filename: Dockerfile
FROM ghcr.io/puppeteer/puppeteer:latest

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt update && apt install sudo &&  apt install gnupg wget -y && \
    sudo wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    sudo apt-get update && \
    sudo apt-get install google-chrome-stable -y --no-install-recommends && \
    sudo rm -rf /var/lib/apt/lists/*


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