SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR=$SCRIPT_DIR/..
SERVER_DIR=$ROOT_DIR/packages/server
DB_DIR=$SERVER_DIR/data

cd $ROOT_DIR

fail () {
  echo $'\n\n*** Error:' $1 $'***\n\n'
  exit 1
}

./scripts/prepare.sh || fail "Failed to prepare project for running"

cd $SERVER_DIR
npm run run-dev || fail "Failed to start Server"