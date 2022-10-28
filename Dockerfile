FROM node
WORKDIR /app
ADD . /app
ENV NODE_ENV production
RUN yarn
EXPOSE 3000
CMD ["yarn", "start"]
