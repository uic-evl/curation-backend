FROM ubuntu:18.04
ENV DEBIAN_FRONTEND=noninteractive

ENV NODE_VERSION=14.15.1
ENV NVM_DIR=/root/.nvm

RUN apt-get update && apt-get install -y curl git
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.37.2/install.sh | bash \
    && . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION} \
    && . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION} \
    && . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION} \
    && apt-get remove -y curl \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

WORKDIR /root
ENV PORT=8000
ENV IMPORTS=imports
ENV PIPELINE=/root/pipeline
ENV FILES_LOCATION=/mnt/files

RUN git clone https://github.com/uic-evl/curation-backend.git \
    && cd curation-backend \
    && npm install \
    && mkdir imports
WORKDIR /root/curation-backend

# so it happens that i forgot to create the imports folder, TODO: create the folder from parameter

# docker run -it -p 8000:8000 -v /where/static/files/are:/mnt/files IMAGE_TAG:VERSION sh -c 'npm start'
# docker run -it -p 8000:8000 -v /mnt/c/Users/jtt/Documents:/mnt/files node:1.0 sh -c 'npm start'