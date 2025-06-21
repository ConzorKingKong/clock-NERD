# Alarm Clock

This is an alarm clock application that allows visitors to sign up and save alarm times. It is a NERD Stack (Node, Express, React, MongoDB) application.

Use `docker compose up` to run the program locally

There is a docker file for m1 macs as well

## env variables

SUPER_SECRET <br>
MONGODB_URI <br>
API_URL <br>

In production, the docker container should be fed a `MONGODB_URI` env variable pointing to the mongodb database instance you wish to use. The container builds after it's been deployed via `yarn start` so you can feed in the `API_URL` of wherever the service will be deployed to so you can avoid CORS errors. And `SUPER_SECRET` will be used for the session cookie secret