# Build Environment: Node + Playwright
FROM alpine:3.16

# Env
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Export port 3000 for Node
EXPOSE 3000

# Copy all app files into Docker Work directory
COPY package*.json /app/
COPY src/ /app

# Install Deps
# RUN npm ci --only=production
RUN npm install
RUN npx playwright install --with-deps firefox

# ENV NODE_ENV production

# USER node
# COPY --chown=node:node . /app

# Run Node index.js file
CMD [ "node", "/app/app.js" ]