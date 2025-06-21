FROM node
EXPOSE 3000
WORKDIR /app
ADD . /app
RUN yarn
CMD ["yarn", "start"]
