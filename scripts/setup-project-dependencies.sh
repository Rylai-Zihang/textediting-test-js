SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
MONGODB_DATA_DIR=$SCRIPT_DIR/../packages/server/data

# Copy git hooks to .git folder
./scripts/install-hooks.sh

npm install

lerna bootstrap

# Create folder for Mongo DB data
mkdir -p $MONGODB_DATA_DIR
# ./scripts/run-dev.sh