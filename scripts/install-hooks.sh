SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
GIT_HOOKS_DIR=$SCRIPT_DIR/../.git/hooks

cp $SCRIPT_DIR/git-pre-commit-hook.sh $GIT_HOOKS_DIR/pre-commit.sh