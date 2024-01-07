FROM ghcr.io/puppeteer/puppeteer:21.6.1
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# Install chromium-browser
RUN apt-get update && apt-get install -y chromium-browser

# Copy the index.js file to the /usr/src/app directory
COPY index.js .

CMD [ "node", "server.js"]
