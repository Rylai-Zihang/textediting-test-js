SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
GIT_HOOKS_DIR=$SCRIPT_DIR/../.git/hooks

cp $SCRIPT_DIR/git-pre-commit-hook.sh $GIT_HOOKS_DIR/pre-commit
cp $SCRIPT_DIR/git-post-commit-hook.sh $GIT_HOOKS_DIR/post-commit
cp $SCRIPT_DIR/git-pre-push-hook.sh $GIT_HOOKS_DIR/pre-push