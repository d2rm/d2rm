#!/bin/bash

HASH="$(git log -n 1 --pretty=format:'%H')"
export COVERALLS_GIT_COMMIT="${HASH}"
export COVERALLS_GIT_BRANCH=dev-angular
cat spec/coverage/chrome/lcov.info | ./node_modules/coveralls/bin/coveralls.js