FROM node:20-alpine
WORKDIR /adameds-admisi
COPY . .
ENV APP_PORT=8081
ENV APP_HOST=0.0.0.0
RUN npm install
EXPOSE ${APP_PORT}/tcp
CMD ["npm", "run", "start"]
