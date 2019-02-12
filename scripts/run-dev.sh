SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR=$SCRIPT_DIR/..
CLIENT_DIR=$ROOT_DIR/packages/client
SERVER_DIR=$ROOT_DIR/packages/server
DB_DIR=$SERVER_DIR/data

fail () {
  echo $'\n\n*** Error:' $1 $'***\n\n'
  exit 1
}

killwait() {
    while kill -0 "$1"; do
        sleep 0.5
    done
}

MONGODB_PID="$(lsof -iTCP:27017 -sTCP:LISTEN -n -Pt)"
echo "<<$MONGODB_PID>>"
if [ ! -z $MONGODB_PID ] ; then
  echo "MongoDB was not terminated properly last time, killing it... Try to restart the script"
  kill -9 $MONGODB_PID
  exit 1
fi

mongod --dbpath $DB_DIR || fail "Failed to launch DB server" &

cd $CLIENT_DIR
npm run clean-build || fail "Failed to clean Client" &

cd $SERVER_DIR
npm run run-dev || fail "Failed to start Server"