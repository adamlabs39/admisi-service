FROM node:19.5.0-alpine
WORKDIR /adameds-admisi
COPY . .
RUN npm install
EXPOSE 8001/tcp
CMD ["npm", "start"]
