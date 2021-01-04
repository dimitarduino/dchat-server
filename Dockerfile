FROM node:15.3.0
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
CMD [ "npm", "start" ]
