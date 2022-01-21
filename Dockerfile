FROM node:lts-alpine

# install simple http server for serving static content
# RUN npm install -g http-server --verbose

# make the 'app' folder the current working directory
WORKDIR .

# copy both 'package.json' and 'package-lock.json' (if available)
COPY . .

RUN npm cache clean --force
# install project dependencies
RUN npm install --verbose --production --force

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
RUN npm run build

EXPOSE 8000
# CMD [ "http-server", "dist" ]
CMD [ "npm", "start" ]