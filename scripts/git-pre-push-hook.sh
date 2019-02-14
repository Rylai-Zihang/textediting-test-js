#!/bin/sh

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_ROOT_DIR=$SCRIPT_DIR/../..

cd $PROJECT_ROOT_DIR

npx jest
