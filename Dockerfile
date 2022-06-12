FROM node:gallium-alpine
WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .
ENTRYPOINT [ "npm", "start" ]