# Filename: Dockerfile
FROM ghcr.io/puppeteer/puppeteer:latest

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get install gnupg wget -y
RUN   wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg 
RUN   sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' 
RUN  apt-get update 
RUN   apt-get install google-chrome-stable -y --no-install-recommends 
RUN   rm -rf /var/lib/apt/lists/*


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