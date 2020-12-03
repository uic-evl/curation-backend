# curation-backend

Where we define all the services for the front-end using a NodeJS and Express.

## Environmental Variables

On a development environment you can use a .env file to map the environmental variables. For the docker container, update the values in the Dockerfile. See `Serving static files` to map the files folder.

```
PORT=8000
IMPORTS=imports # import folder
PIPELINE=/location/of/some/python/script/to/run/pipeline
FILES_LOCATION=/mnt/files
```

## Serving static files

The back-end server serves the PDFs and figures to the front-end using the `server:port/files/` route. In the docker container, this is configured with the environmental variable `FILES_LOCATION` that maps to `/mnt/files`. Therefore, when starting the docker container, pass the parameter `-v /route/to/files/:/mnt/files` where `/route/to/files`.

## Pipeline integration

NodeJS can start the [curation pipeline](https://github.com/uic-evl/curation-pipeline) by spawning the Python process. However, it does not track if the process ends successfully as the pipeline may process a large batch of documents. **We are working on adding monitoring features for the end user**. Also, for convenience, the docker container includes the pipeline as part of the back-end image. To use an independent pipeline container, check its corresponding repository.
