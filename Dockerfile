FROM node
EXPOSE 3000
EXPOSE 80
WORKDIR /app
ADD . /app
RUN yarn
CMD ["yarn", "start"]
