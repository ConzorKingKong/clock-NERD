FROM node
WORKDIR /app
ADD . /app
RUN yarn
EXPOSE 3000
CMD ["yarn", "start"]
