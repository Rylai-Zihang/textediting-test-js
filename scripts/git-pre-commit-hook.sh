SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_ROOT_DIR=$SCRIPT_DIR/../..

cd $PROJECT_ROOT_DIR

LAST_COMMIT_HASH="$(git rev-parse HEAD)"
lerna run tslint --since $LAST_COMMIT_HASH