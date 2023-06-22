docker build . --tag 'sharp-test:latest' &&
docker run \
--memory 4g \
-v ./outputs:/outputs \
-it \
--rm \
-P \
-e NODE_ENV=production \
'sharp-test'