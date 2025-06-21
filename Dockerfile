FROM node
EXPOSE 3000
ENV MONGODB_URI
WORKDIR /app
ADD . /app
RUN yarn
CMD ["yarn", "start"]
