FROM node:14.18.1 as setup

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json .
RUN npm install

COPY . .

# archive 404 repos
RUN echo "deb https://archive.debian.org/debian stretch main" > /etc/apt/sources.list
# install psql
RUN apt-get update
RUN apt-get -y --allow-unauthenticated install postgresql-client

# make wait-for-postgres.sh executable
RUN chmod +x wait-for-postgres.sh

CMD ["/bin/bash"]
