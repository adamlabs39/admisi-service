FROM node:19.5.0-alpine
WORKDIR /adameds-admisi
COPY . .
ENV APP_PORT=8083
ENV APP_HOST=0.0.0.0
RUN npm install
RUN npm install -g @infisical/cli
EXPOSE ${APP_PORT}/tcp
CMD ["sh", "-c", "infisical run --env=development -- npm run start"]
# CMD ["npm", "run", "start"]
