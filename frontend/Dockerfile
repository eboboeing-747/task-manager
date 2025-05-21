FROM nginx:alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN apk add --update npm
RUN npm install --global http-server
RUN npm install
COPY . ./
EXPOSE 5000
CMD ["npm", "run", "build"]
CMD ["http-server", "."]
