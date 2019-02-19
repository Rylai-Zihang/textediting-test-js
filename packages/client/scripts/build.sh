mkdir -p ./dist \
  && mkdir -p ./dist/atomics-wait-async \
  && cp ./src/index.html ./dist/index.html \
  && cp ./libraries/atomics-wait-async/polyfill.js ./dist/atomics-wait-async/polyfill.js \
  && webpack --watch --display-error-details