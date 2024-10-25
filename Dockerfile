FROM 19.5.0-alpine
WORKDIR /adameds-admisi
RUN npm install
COPY . .
EXPOSE 8001/tcp
CMD ["npm", "start"]
