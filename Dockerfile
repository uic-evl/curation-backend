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
ENV IMPORTS=/root/curation-backend/imports
ENV PIPELINE=/root/pipeline

RUN git clone https://github.com/uic-evl/curation-backend.git \
    && cd curation-backend \
    && npm start

# docker run -it -p 8000:8000 -v /mnt:/where/static/files/are curation/backend:0.1 /bin/bash